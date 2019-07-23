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
        _ = require('lodash'),
        async = require('async'),
        cep = require('../lib/cep.js')(grunt);

    // Gets signing toolkit executable path
    var zxp_path = (function ()
    {
        var exec_name = require('zxp-provider').env;
        if (!exec_name) exec_name=require('zxp-provider').bin;

        return exec_name;
    })();

    /**
     * Generates a self-signed certificate.
     */
    var certificate = function (callback, options)
    {
        if (!options.bundle.author_name || !options.bundle.author_name.length)
        {
            grunt.fatal('Can not generate a self-signed certificate without specifying an "author_name" in the bundle properties.');
            callback(error, result);
        }

        // Options
        var spawn_options = [
            '-selfSignedCert',
            'US', 'NY',
            options.bundle.author_name,
            options.bundle.author_name,
            options['package'].certificate.password,
            options['package'].certificate.file
        ];

        var spawn_cmd = zxp_path + " " + spawn_options.join(' ');

        // Run ZXP sign command
        grunt.log.writeln().writeln((spawn_cmd).magenta);
        var errors = [], result;

        var cp = require('child_process');
        var spawned = cp.spawn(spawn_cmd, { shell: true });

		spawned.stdout.on('data', function(data) {
            grunt.verbose.writeln(data);
            result = data;
		});

		spawned.stderr.on('data', function(data) {
			errors.push(data);
		});

		spawned.on('close', function(code) {
			grunt.verbose.writeln("closed " + code);
			if (code !== 0 )
            {
                grunt.log.error(result);
                grunt.fatal('An error occurred when generating the self-signed certificate.');
            }

            callback(errors, result);
		});

    };

    /**
     * Packages and signs an HTML5 extension.
     */
    var sign = function (callback, input_folder, output_file, options)
    {
         if (!output_file)
        {
            grunt.fatal('Invalid output file.');
        }

        if (!input_folder)
        {
            grunt.fatal('Invalid input folder.');
        }

        var spawn_options = [
            '-sign',
            input_folder,
            output_file,
            options['package'].certificate.file,
            options['package'].certificate.password,
        ];
        var errors = [];

        if (options['package'].timestamp_url && options['package'].timestamp_url.length)
        {
            spawn_options.push('-tsa', options['package'].timestamp_url);
        }

        grunt.verbose.writeln(output_file.white);

        var spawn_cmd = zxp_path + " " + spawn_options.join(' ');

        grunt.verbose.writeln((spawn_cmd).magenta)
        .or.write('Creating ZXP package at ' + output_file.cyan + '...');

        var cp = require('child_process');

        var spawned = cp.spawn(spawn_cmd, { shell: true });

		spawned.stdout.on('data', function(data) {
            grunt.verbose.writeln(data);
		});

		spawned.stderr.on('data', function(data) {
            errors.push(data);
		});

		spawned.on('close', function(code) {
			grunt.verbose.writeln("closed " + code);
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
    };

    // Public interface
    var zxp = {};
    zxp.certificate = certificate;
    zxp.sign = sign;
    return zxp;
};
