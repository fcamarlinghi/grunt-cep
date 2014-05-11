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
        // Validate manifest
        grunt.verbose.or.write('Loading extension manifest template...');

        if (!grunt.file.exists(build.manifest))
        {
            grunt.verbose.or.error();
            grunt.fatal('Unable to read extension manifest file template at ' + build.manifest.cyan + '.');
        }
        else
            grunt.verbose.or.ok();

        // Generate template data
        grunt.verbose.or.write('Generating extension manifest...');

        // Get base data
        // <Host> list
        var list_hosts = [];
        var products = build.products;
        var families = build.families;

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

        // Process and save manifest file
        var dest = path.join(build.staging, '/CSXS/manifest.xml');
        var data = _.extend({},
            {
                'extension': build.extension,
                'hosts': list_hosts.join('\n\t\t\t'),
            });

        var processed = grunt.template.process(grunt.file.read(build.manifest), { data: data, delimiters: 'cep' });
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
            mxi_filename = options.extension.basename + '.mxi';

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
            var cc_index = builds[i].families.indexOf('CC');

            if (cc_index > -1)
            {
                // CC products are parsed separately
                builds[i].families.splice(cc_index, 1);

                // Parse CC products
                builds[i].products.forEach(function (product)
                {
                    var version_range = get_version_range(product, ['CC']);
                    data.files.push('<file destination="" file-type="CSXS" products="' + cep.hosts.get_cc_family_name(cep.hosts.getProduct(product).familyname) + '" maxVersion="' + version_range.max + '" minVersion="' + version_range.min + '" source="' + path.basename(builds[i].output_file) + '" />');
                });
            }

            if (builds[i].families.length === 0)
                continue;

            // Parse CS products
            builds[i].products.forEach(function (product)
            {
                var version_range = get_version_range(product, builds[i].families);
                data.files.push('<file destination="" file-type="CSXS" products="' + cep.hosts.getProduct(product).familyname + '" maxVersion="' + version_range.max + '" minVersion="' + version_range.min + '" source="' + path.basename(builds[i].output_file) + '" />');
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
        data = _.extend(data, options.extension);

        // Setup 'update.xml', if needed
        if (options['package'].update.enabled && data.update_url.length)
            data.update_url += 'update.xml';

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

        var changes_path = path.join(options['package'].update.changelog_folder, options.extension.version + options['package'].update.changelog_extension),
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
        var update_data = {
            'version': options.extension.version,
            'url': options.extension.update_url + options.extension.name.replace(/[\s]+/g, '_').toLowerCase() + '_' + options.extension.version + '.zxp',
            'description': description,
        };

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