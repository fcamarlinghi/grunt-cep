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
    var path = require('path');
    var _ = require('lodash');
    var cep = require('../lib/cep.js')(grunt);

    /**
     * Creates a CSXS manifest file from template.
     */
    var manifest = function (callback, build)
    {
        var bundle = build.bundle;

        // Validate manifest
        grunt.verbose.or.write('Generating bundle manifest...');

        if (!bundle.manifest)
        {
            grunt.verbose.or.error();
            grunt.fatal('No bundle manifest file specified.');
        }
        else if (!grunt.file.exists(bundle.manifest))
        {
            grunt.verbose.or.error();
            grunt.fatal('Unable to read bundle manifest file template at ' + bundle.manifest.cyan + '.');
        }

        // Generate manifest data for each extension
        var extension_list_manifest = [],
            extensions_manifest = [];

        build.extensions.forEach(function (extension)
        {
            var data = _.extend({}, { 'extension': extension, 'build': build, });

            // <ExtensionList>
            extension_list_manifest.push(grunt.template.process('<Extension Id="<%= extension.id %>" Version="<%= extension.version %>" />', { data: data }));

            // <Extensions>
            if (!extension.manifest)
            {
                grunt.verbose.or.error();
                grunt.fatal('No extension manifest file specified for ' + extension.id + '.');
            }
            else if (!grunt.file.exists(extension.manifest))
            {
                grunt.verbose.or.error();
                grunt.fatal('Unable to read extension manifest file template at ' + extension.manifest.cyan + ' for ' + extension.id + '.');
            }

            extensions_manifest.push(grunt.template.process(grunt.file.read(extension.manifest), { data: data }));
        });

        // Generate bundle manifest
        // <Host> list
        var list_hosts = [],
            products = build.products,
            families = build.families;

        if (products)
        {
            for (var i = 0, n = products.length; i < n; i++)
            {
                var host = cep.hosts.getProduct(products[i]);
                var range = cep.hosts.getVersionRange(products[i], families);

                for (var j = 0; j < host.ids.length; j++)
                {
                    list_hosts.push('<Host Name="' + host.ids[j] + '" Version="[' + range.min + ',' + range.max + ']" />');
                }
            }
        }

        // Templating
        var dest = path.join(build.staging, '/CSXS/manifest.xml');

        var data = _.extend({},
            {
                'bundle': bundle,
                'extension_list': extension_list_manifest.join('\n\t\t\t'),
                'extensions': extensions_manifest.join('\n\t\t\t'),
                'hosts': list_hosts.join('\n\t\t\t'),
            });

        var processed = grunt.template.process(grunt.file.read(bundle.manifest), { data: data });
        grunt.file.write(dest, processed);

        grunt.verbose.or.ok();
        callback();
    };

    /**
     * Populates extension MXI file template.
     */
    var mxi = function (callback, options)
    {
        var builds = options.builds,
            product_versions = {},
            data = {
                files: [],
                products: []
            },
            mxi_filename = options.bundle.basename + '.mxi';

        grunt.log.write('Generating ' + mxi_filename.cyan + ' file from template...');

        function get_version_range(product, families)
        {
            var range = cep.hosts.getVersionRange(product, families);

            // Store version range
            if (!product_versions.hasOwnProperty(product))
                product_versions[product] = {};

            // If current range values are higher or lower than
            // the stored ones, save them
            if (!product_versions[product].min || parseFloat(range.min) < parseFloat(product_versions[product].min))
                product_versions[product].min = range.min;

            if (!product_versions[product].max || parseFloat(range.max) > parseFloat(product_versions[product].max))
                product_versions[product].max = range.max;

            return range;
        };

        // Create <files> list
        for (var i = 0, n = builds.length; i < n; i++)
        {
            // Parse CC products
            builds[i].products.forEach(function (product)
            {
                var version_range = get_version_range(product, builds[i].families);
                data.files.push('<file destination="" file-type="CSXS" products="' + cep.hosts.get_cc_family_name(cep.hosts.getProduct(product).familyname) + '" maxVersion="' + version_range.max + '" minVersion="' + version_range.min + '" source="' + path.basename(builds[i].output_file) + '" />');
            });
        }

        // Create <product> list
        for (var product in product_versions)
        {
            data.products.push('<product familyname="' + cep.hosts.getProduct(product).familyname + '" maxversion="' + product_versions[product].max + '" primary="true" version="' + product_versions[product].min + '" />');
        }

        // Fill in .mxi template
        data.files = data.files.join('\n\t\t');
        data.products = data.products.join('\n\t\t');
        data = _.merge(_.extend({}, data), options);

        // Setup 'update.xml', if needed
        if (options['package'].update.enabled)
            data.bundle.update_url += 'update.xml';

        // Process template
        var processed = grunt.template.process(grunt.file.read(options['package'].mxi), { data: data });
        grunt.file.write(path.resolve(options.staging, mxi_filename), processed);

        grunt.log.ok();
        callback();
    };

    /**
     * Populates extension "update.xml" file template.
     */
    var update = function (callback, options)
    {
        grunt.log.write('Generating ' + 'update.xml'.cyan + ' file...');

        var changes_path = path.join(options['package'].update.changelog_folder, options.bundle.version + options['package'].update.changelog_extension),
            description = '';

        if (grunt.file.exists(changes_path))
        {
            // Parse changelog txt and generate description in update.xml file
            description = '<dl>';
            description += '<dt><b>' + path.basename(changes_path, '.txt') + '</b></dt>';
            description += '<dd>' + grunt.file.read(changes_path).replace(/\r?\n/g, '<br>') + '</dd>';
            description += '</dl>';
        }

        // Put templating data together
        var update_data = _.extend({}, options, {
            'download_url': options.bundle.update_url + options.bundle.name.replace(/[\s]+/g, '_').toLowerCase() + '_' + options.bundle.version + '.zxp',
        });

        // Process template and save result
        var processed = grunt.template.process(grunt.file.read(options['package'].update.file), { data: update_data });
        grunt.file.write(path.join(options.staging, '../', 'update.xml'), processed);
        grunt.log.ok();

        callback();
    };

    // Public interface
    var xml = {};
    xml.manifest = manifest;
    xml.mxi = mxi;
    xml.update = update;
    return xml;
};