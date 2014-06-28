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
        async = require('async'),
        _ = require('lodash'),
        cep = require('./cep.js')(grunt);

    /**
     * Compiles the specified build.
     */
    var compile = function (callback, build)
    {
        var tasks = [];
        grunt.log.writeln().writeln(('Compiling bundle for Adobe ' + build.products.join(', ').cyan + ' - ' + build.families.join(', ').cyan + '...').bold);

        tasks.push(
            /**
             * Do some cleanup.
             */
            function (callback)
            {
                // Validate input/output files
                if (typeof build.staging !== 'string' || !build.staging.length)
                    grunt.fatal('Invalid "staging" folder: ' + String(build.staging).cyan + '.');

                if (typeof build.source !== 'string' || !build.source.length)
                    grunt.fatal('Invalid "source" folder: ' + String(build.source).cyan + '.');

                // Clean current output folder
                if (grunt.file.exists(build.staging) && grunt.file.isDir(build.staging))
                    grunt.file.delete(build.staging, { force: true });

                grunt.file.mkdir(build.staging);
                callback();
            },

            /**
             * Copy all files.
             */
            function (callback)
            {
                // Copy all the content of the source folder over to the output folder
                var message = 'Copying ' + build.source.cyan + ' folder...';
                grunt.verbose.writeln(message).or.write(message);

                cep.utils.copy({ cwd: build.source }, build.staging + '/', '**/*.*');
                grunt.verbose.or.ok();
                callback();
            },

            /**
             * Generate .debug file.
             */
            function (callback)
            {
                if (build.profile === 'debug' || build.profile === 'launch')
                {
                    var message = 'Generating ' + '.debug'.cyan + ' file...';
                    grunt.verbose.writeln(message).or.write(message);

                    var dotdebug_file = path.join(cep.utils.plugin_folder(), 'res/.debug');

                    if (grunt.file.exists(dotdebug_file))
                    {
                        if (typeof build.launch.host_port !== 'number' || build.launch.host_port < 0)
                        {
                            grunt.verbose.or.error();
                            grunt.fatal('Invalid host debug port ' + build.launch.host_port + '.');
                        }

                        var data = { 'build': build },
                            processed = grunt.template.process(grunt.file.read(dotdebug_file), { data: data });

                        grunt.file.write(path.join(build.staging, '.debug'), processed);
                    }

                    grunt.verbose.or.ok();
                }

                callback();
            },

            /**
             * Generate appropriate manifest file.
             */
            function (callback)
            {
                require('./xml')(grunt).manifest(callback, build);
            }
        );

        // Run child tasks
        async.series(tasks, function (err, result) { callback(err, result); });
    };

    /**
     * Launches debug with specified settings.
     */
    var launch = function (callback, build, host)
    {
        var tasks = [],
            launch_config = {
                product: build.launch.product,
                family: build.launch.family,
                host: host
            },
            exec = require('child_process').exec;

        grunt.log.writeln().writeln('Launching application...'.bold);

        tasks.push(
            /**
             * Detect application executable location.
             */
            function (callback)
            {
                var folder_apps, folder_servicemgr;

                if (global.IS_WINDOWS)
                {
                    folder_apps = path.join(process.env["PROGRAMFILES"], '/Adobe');

                    if (launch_config.family === 'CC')
                        folder_servicemgr = path.join(process.env['APPDATA'], '/Adobe/CEPServiceManager4/extensions');
                    else
                        folder_servicemgr = path.join(process.env['APPDATA'], '/Adobe/CEP/extensions');
                }
                else
                {
                    folder_apps = path.join('/Applications', '/Adobe');

                    if (launch_config.family === 'CC')
                        folder_servicemgr = path.join(process.env['APPDATA'], '/Library/Application Support/Adobe/CEPServiceManager4/extensions');
                    else
                        folder_servicemgr = path.join(process.env['APPDATA'], '/Library/Application Support/Adobe/CEP/extensions');
                }

                // Extension install path
                launch_config.install_path = path.join(folder_servicemgr, build.bundle.basename) + '.debug';

                // Application folder
                var folder_family = {
                    'CC': 'CC',
                    'CC2014': 'CC 2014',
                };

                var folder_name = launch_config.host.hasOwnProperty('folder') ? launch_config.host.folder : '/Adobe ' + launch_config.host.name + ' ' + folder_family[launch_config.family];
                launch_config.app_folder = path.join(folder_apps, folder_name);

                if (launch_config.family === 'CC' && launch_config.host.x64 && global.IS_X64)
                    launch_config.app_folder += ' (64 Bit)';

                if (!grunt.file.exists(launch_config.app_folder))
                {
                    grunt.fatal('Unable to find Adobe ' + launch_config.host.name + ' ' + launch_config.family + ' folder at "' + launch_config.app_folder + '".');
                    return false;
                }

                // Application executable path
                launch_config.app_bin = path.join(launch_config.app_folder, global.IS_WINDOWS ? launch_config.host.bin.win : launch_config.host.bin.mac);

                if (!grunt.file.exists(launch_config.app_bin))
                {
                    grunt.fatal('Unable to find Adobe ' + launch_config.host.name + ' ' + launch_config.family + ' executable at "' + launch_config.app_bin + '".');
                    return false;
                }

                callback();
            },

            /**
             * Kill the specified host application process if it is running.
             */
            function (callback)
            {
                var options = {};

                if (global.IS_WINDOWS)
                {
                    options.cmd = 'Taskkill';
                    options.args = ['/IM', launch_config.host.bin.win];
                }
                else
                {
                    options.cmd = 'kill';
                    options.args = ['-9', '`ps -ef | grep "' + launch_config.host.bin.mac + '" | grep -v grep | awk \'{print $2}\'`'];
                }

                grunt.verbose.writeln((options.cmd + ' ' + options.args.join(' ')).magenta)
                .or.write('Killing host application process...');
                var spawned = grunt.util.spawn(options, function (error, result, code)
                {
                    grunt.verbose.or.ok();

                    // Let some time pass so that application can be closed correctly
                    // TODO: find a better way of doing this
                    setTimeout(function ()
                    {
                        callback();
                    }, 1000);
                });
                spawned.stdout.on('data', function (data) { grunt.verbose.writeln(data); });
                spawned.stderr.on('data', function (data) { grunt.verbose.writeln(data); });
            },

            /**
             * Set "PlayerDebugMode" flag in plist file or Windows registry.
             */
            function (callback)
            {
                var PLISTS,
                    options,
                    host_family = launch_config.family;

                if (global.IS_MAC)
                {
                    PLISTS = {
                        'CC': path.join(process.env['HOME'], '/Library/Preferences/com.adobe.CSXS.4.plist'),
                        'CC2014': path.join(process.env['HOME'], '/Library/Preferences/com.adobe.CSXS.5.plist'),
                    };

                    if (!PLISTS.hasOwnProperty(host_family))
                        return;

                    options = {
                        cmd: 'defaults',
                        args: ['write', PLISTS[host_family], 'PlayerDebugMode', '1']
                    };
                }
                else
                {
                    PLISTS = {
                        'CC': 'HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.4\\',
                        'CC2014': 'HKEY_CURRENT_USER\\Software\\Adobe\\CSXS.5\\',
                    };

                    if (!PLISTS.hasOwnProperty(host_family))
                        return;

                    options = {
                        cmd: 'reg',
                        args: ['add', PLISTS[host_family], '/v', 'PlayerDebugMode', '/d', '1', '/f']
                    };
                }

                grunt.verbose.writeln((options.cmd + ' ' + options.args.join(' ')).magenta)
                .or.write('Setting OS debug mode...');
                var spawned = grunt.util.spawn(options, function (error, result, code)
                {
                    if (code !== 0)
                    {
                        grunt.verbose.or.ok();
                        grunt.fatal(error);
                    }
                    else
                        grunt.verbose.or.ok();

                    callback(error, result);
                });
                spawned.stdout.on('data', function (data) { grunt.verbose.writeln(data); });
                spawned.stderr.on('data', function (data) { grunt.verbose.writeln(data); });
            },

            /**
             * Install extension by copying files to the 'extensions' folder.
             */
            function (callback)
            {
                var message = 'Installing extension at ' + launch_config.install_path.cyan + '...';
                grunt.verbose.writeln(message).or.write(message);

                // Clean-up install folder
                if (grunt.file.exists(launch_config.install_path))
                    grunt.file.delete(launch_config.install_path, { force: true });

                // Copy files over
                cep.utils.copy({ 'cwd': build.staging },
                    launch_config.install_path,
                    '**/*.*');

                cep.utils.copy({ 'cwd': build.staging },
                    launch_config.install_path,
                    '**/.*');

                grunt.verbose.or.ok();
                callback();
            },

            /**
             * Launch the specified host application.
             */
            function (callback)
            {
                var options = {};

                if (global.IS_MAC)
                {
                    options = {
                        cmd: 'open',
                        args: ['-F', '-n', launch_config.app_bin],
                    };
                }
                else
                {
                    options = {
                        cmd: 'explorer.exe',
                        args: ['"' + launch_config.app_bin + '"'],
                    };
                }

                grunt.verbose.writeln((options.cmd + ' ' + options.args.join(' ')).magenta)
                .or.write('Starting host application...');

                exec(options.cmd + ' ' + options.args.join(' '), function (error, result, code)
                {
                    grunt.verbose.or.ok();
                    // REVIEW: command seems to fail on Windows even if in practice it works just fine...
                    // For now we just do not pass error to the callback to prevent the task from failing
                    callback(/*error, result*/);
                });
            }
        );

        // Run child tasks
        async.series(tasks, function (err, result) { callback(err, result); });
    };

    // Public interface
    var compiler = {};
    compiler.compile = compile;
    compiler.launch = launch;
    return compiler;
};