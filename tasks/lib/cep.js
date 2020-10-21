/**
 * Copyright 2014-2015 Francesco Camarlinghi
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
        HOSTS = require('./hosts.json');

    var cep = {};

    // *************************************************************
    // Hosts helpers
    var hosts = cep.hosts = {};

    /**
     * Gets information about a single product.
     *
     * @param {string} product
     * @param {string} family
     * @returns {object}
     */
    hosts.getProduct = function (product, family)
    {
        product = product.toLowerCase();

        if (!family)
        {
            family = 'CC2021';
        }

        if (!HOSTS.hasOwnProperty(family))
        {
            throw new Error('Unknown product family "' + family + '"');
        }

        if (!HOSTS[family].hasOwnProperty(product))
        {
            throw new Error('Unknown product "' + product + '" (' + family + ')');
        }

        return HOSTS[family][product];
    };

    /**
     * Returns the individual product version range for
     * the given product families.
     *
     * @param {string} product
     * @param {array} families
     * @returns {object}
     */
    hosts.getVersionRange = function (product, families)
    {
        var i, n, min, max, host;

        for (i = 0, n = families.length; i < n; i++)
        {
            host = hosts.getProduct(product, families[i]);

            if (!min || parseFloat(host.version.min) < parseFloat(min))
            {
                min = host.version.min;
            }

            if (!max || parseFloat(host.version.max) > parseFloat(max))
            {
                max = host.version.max;
            }
        }

        return { min: min, max: max };
    };

    /**
     * Maps the passed product family name to the CC equivalent (needed in MXI files).
     *
     * @returns {string}
     */
    hosts.get_cc_family_name = function (product)
    {
        // CC products need to be specified using the following mapping
        // http://helpx.adobe.com/extension-manager/kb/general-mxi-elements.html#id_64891
        var map = {
            'Illustrator': 'Illustrator,Illustrator32,Illustrator64',
            'InCopy': 'InCopy,InCopy32,InCopy64',
            'InDesign': 'InDesign,InDesign32,InDesign64',
            'Photoshop': 'Photoshop,Photoshop32,Photoshop64'
        };

        return map[product] || product;
    };

    // *************************************************************
    // Utils
    var utils = cep.utils = {};

    /**
     * Recursive copy utility.
     */
    utils.copy = function (options, dest, patterns)
    {
        options || (options = {});

        grunt.file.expand.apply(null, [options, patterns]).forEach(function (file)
        {
            var src = (options.cwd) ? path.join(options.cwd, file) : file;
            var final_dest = (dest) ? path.join(dest, file) : file;

            if (grunt.file.isDir(src))
            {
                grunt.verbose.writeln('Creating ' + final_dest.cyan);
                grunt.file.mkdir(final_dest);
            }
            else
            {
                grunt.verbose.writeln('Copying ' + src.cyan + ' -> ' + final_dest.cyan);
                grunt.file.copy(src, final_dest);
            }
        });
    };

    /**
     * Gets plugin base folder.
     */
    utils.plugin_folder = function ()
    {
        return path.normalize(path.join(__dirname, '../../'));
    };

    return cep;
};
