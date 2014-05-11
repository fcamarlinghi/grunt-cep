/**
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt)
{
    'use strict';

    var path = require('path'),
        _ = require('lodash'),
        async = require('async'),
        uuid = require('node-uuid'),
        compiler = require('./lib/compiler.js')(grunt),
        cep = require('./lib/cep.js')(grunt),
        xml = require('./lib/xml.js')(grunt),
        zxp = require('./lib/zxp.js')(grunt);

    // grunt cep
    grunt.registerMultiTask('cep', 'Compiles, packages and debug Creative Cloud extensions.', function ()
    {
        var done = this.async(),
            options = _.merge({}, require('../options/defaults.js'), this.options()),
            tasks = [];

        // VALIDATION
        if (['debug', 'launch', 'package'].indexOf(options.profile) < 0)
        {
            grunt.log.error();
            grunt.fatal('Invalid build profile: "' + options.profile + '".');
        }


        // SETUP
        // Generate needed configuration settings
        if (!options.extension.basename)
            options.extension.basename = options.extension.id.replace(/[\s]+/g, '.').toLowerCase();

        // Make sure update_url correctly ends with a dash
        var update_url = options.extension.update_url;
        if (update_url.length && update_url.indexOf('/', update_url.length - 1) === -1)
            options.extension.update_url = update_url + '/';

        // Set some useful global variables
        global.IS_WINDOWS = !!process.platform.match(/^win/);
        global.IS_MAC = !IS_WINDOWS;
        global.IS_X64 = (process.arch === 'x64');


        // EXECUTION
        // Check whether we should launch debug or package the full extension
        if (options.profile === 'debug' || options.profile === 'launch')
        {
            grunt.log.writeln(options.profile.yellow + ' profile is enabled.');

            var build, host;

            tasks.push(
                /**
                 * Validate build, product and family.
                 */
                function (callback)
                {
                    grunt.log.write('Validating options...');
                    var builds = options.builds,
                        product = options.launch.product,
                        family = 'CC'; // REVIEW: CEP01 options.family

                    if (!_.isArray(builds) || !builds.length)
                    {
                        grunt.log.error();
                        grunt.fatal('No builds are currently defined in configuration file.');
                    }

                    var product_index, family_index;

                    if (family)
                        family = family.toUpperCase();

                    if (!product/* && !family*/)
                    {
                        build = builds[0];
                        product = build.products[0];
                        // REVIEW: CEP01 //family = _.last(build.families);
                    }
                    else
                    {
                        for (var i = 0, n = builds.length; i < n; i++)
                        {
                            product_index = !product || builds[i].products.indexOf(product);
                            // REVIEW: CEP01 //family_index = !family || builds[i].families.indexOf(family);

                            if (product_index !== -1/* && family_index !== -1*/)
                            {
                                build = builds[i];
                                product = build.products[!product ? 0 : product_index];
                                // REVIEW: CEP01 //family = build.families[!family ? 0 : family_index];
                                break;
                            }
                        }
                    }

                    build.families = ['CC'];

                    if (!build || !product || !family)
                    {
                        grunt.log.error();
                        grunt.fatal('No matching build configuration found for given options.');
                        callback(true);
                    }
                    else
                    {
                        build = _.merge({}, options, build);
                        build.launch.product = product;
                        build.launch.family = family;
                        callback();
                    }
                },

                /**
                 * Validate host.
                 */
                function (callback)
                {
                    try
                    {
                        host = cep.hosts.getProduct(build.launch.product, build.launch.family);
                    }
                    catch (err)
                    {
                        grunt.log.error();
                        grunt.fatal(err.message);
                    }

                    if (!host)
                    {
                        grunt.log.error();
                        grunt.fatal('No matching host found.');
                    }

                    grunt.log.ok();
                    callback();
                },

                /**
                 * Compile extension.
                 */
                function (callback)
                {
                    build.extension.id = build.extension.id + '.debug';
                    build.extension.name = build.extension.name + ' (debug)';
                    build.staging = path.join(build.staging, 'debug');

                    // Execute only the build that is needed for debugging
                    compiler.compile(callback, build);
                },

                /**
                 * Launch extension in host.
                 */
                function (callback)
                {
                    if (options.profile === 'launch')
                        compiler.launch(callback, build, host);
                }
            );
        }
        else
        {
            grunt.log.writeln(options.profile.green + ' profile is enabled.');

            tasks.push(
                /**
                 * Initialization.
                 */
                function (callback)
                {
                    // Create temporary 'package' folder
                    options.staging = path.join(options.staging, 'package');

                    if (grunt.file.exists(options.staging))
                        grunt.file.delete(options.staging, { force: true });

                    grunt.file.mkdir(options.staging);

                    // Copy MXI icon over and update icon path
                    grunt.file.copy(options.extension.icons.mxi, path.join(options.staging, path.basename(options.extension.icons.mxi)));
                    options.extension.icons.mxi = path.basename(options.extension.icons.mxi);

                    // Check whether an 'update.xml' file should be generated
                    options['package'].update.enabled = grunt.file.exists(options['package'].update.file);

                    callback();
                },

                /**
                 * Check for certificate file.
                 */
                function (callback)
                {
                    // Validate config
                    if (!grunt.file.exists(options['package'].certificate.file))
                        require('./certificate.js')(grunt).generate(callback, options);
                    else
                        callback();
                },

                /**
                 * Execute multiple compile/package tasks, one per-build.
                 */
                function (callback)
                {
                    var builds = options.builds,
                        tasks = [];

                    if (!_.isArray(builds) || !builds.length)
                    {
                        grunt.log.error();
                        grunt.fatal('No builds are currently defined in configuration file.');
                    }

                    builds.forEach(function (build)
                    {
                        // Generate output file name and folder
                        var name = uuid.v4();
                        build.output_file = name + '.zxp';
                        build.staging = path.join(options.staging, '../', 'release');

                        // REVIEW: CEP01
                        build.families = ['CC'];

                        // Compiler
                        tasks.push(function (callback)
                        {
                            compiler.compile(callback, _.merge({}, options, build));
                        });

                        // ZXP
                        tasks.push(function (callback)
                        {
                            zxp.sign(callback,
                                build.staging,
                                path.join(options.staging, name + '.zxp'),
                                options);
                        });
                    });

                    // Save builds back to config
                    // This way 'output_file' will be available to other tasks
                    options.builds = builds;

                    // Run compiler & zxp tasks
                    async.series(tasks, function (err, result) { callback(err, result); })
                },

                /**
                 *  Generate MXI file.
                 */
                function (callback)
                {
                    grunt.log.writeln('Packaging extension...'.bold);
                    xml.mxi(callback, options);
                },

                /**
                 * Generate 'update.xml'.
                 */
                function (callback)
                {
                    if (options['package'].update.enabled)
                        xml.update(callback, options);
                },

                /**
                 * Package hybrid extension.
                 */
                function (callback)
                {
                    var final_zxp = path.join(options.staging, '../', options.extension.name.replace(/[\s]+/g, '_').toLowerCase() + '_' + options.extension.version + '.zxp');

                    // It seems that the packaging utility does not overwrite files automatically
                    // So we delete the older ZXP if it exists in the folder
                    if (grunt.file.exists(final_zxp))
                        grunt.file.delete(final_zxp);

                    zxp.sign(callback,
                            options.staging,
                            final_zxp,
                            options);
                }
            );
        }

        // Run child tasks
        async.series(tasks, function (err, result) { done(err, result); })
    });
};