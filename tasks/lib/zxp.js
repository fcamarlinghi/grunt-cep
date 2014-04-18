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
    var async = require('async');
    var cep = require('../lib/cep.js')(grunt);

    // Gets signing toolkit executable path
    function get_zxp_path()
    {
        var exec_name;

        if (global.IS_WINDOWS)
        {
            if (global.IS_X64)
                exec_name = 'ccextensionswin64.exe';
            else
                exec_name = 'ccextensionswin32.exe';
        }
        else
        {
            exec_name = 'ccextensionsmac.dmg';
        }

        return path.resolve(__dirname, '../../bin/' + exec_name);
    };

    /**
     * Generates a self-signed certificate.
     */
    var certificate = function (callback, options)
    {
        // Options
        var options = {
            cmd: get_zxp_path(),
            args: [
                    '-selfSignedCert',
                    'US', 'NY',
                    options.extension.author_name,
                    options.extension.author_name,
                    options['package'].certificate.password,
                    options['package'].certificate.file
            ],
        };

        // Run ZXP sign command
        grunt.log.writeln().writeln((options.cmd + ' ' + options.args.join(' ')).magenta);
        var spawned = grunt.util.spawn(options, function (error, result, code)
        {
            if (code !== 0)
            {
                grunt.log.error(result);
                grunt.fatal('An error occurred when generating the self-signed certificate.');
            }
            
            callback(error, result);
        });
    };

    /**
     * Packages and signs an HTML5 extension.
     */
    var sign = function (callback, input_folder, output_file, options)
    {
        if (!output_file)
            grunt.fatal('Invalid output file.');

        if (!input_folder)
            grunt.fatal('Invalid input folder.');

        var spawn_options = {
                cmd: get_zxp_path(),
                args: [
                    '-sign',
                    input_folder,
                    output_file,
                    options['package'].certificate.file,
                    options['package'].certificate.password,
                ]
            },
            errors = [];

        grunt.verbose.writeln(output_file.white);
        grunt.verbose.writeln((spawn_options.cmd + ' ' + spawn_options.args.join(' ')).magenta)
        .or.write('Creating ZXP package at ' + output_file.cyan + '...');

        var spawned = grunt.util.spawn(spawn_options, function (error, result, code)
        {
            if (errors.length)
            {
                grunt.log.error().writeln(errors.join('\n'));
                grunt.fatal('Unable to create ZXP package.');
                callback(false);
            }
            else
            {
                callback();
            }
        });
        spawned.stdout.on('data', function (data) { grunt.log.writeln(data); });
        spawned.stderr.on('data', function (data) { errors.push(data); });
    };

    // Public interface
    var zxp = {};
    zxp.certificate = certificate;
    zxp.sign = sign;
    return zxp;
};