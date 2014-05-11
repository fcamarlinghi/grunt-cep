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

'use strict';

// Default extension configuration
module.exports =
{
    // Build profile
    // Valid values include:
    // - debug: builds the extension in debug mode.
    // - launch: builds the extension in debug mode, installs the extension in the host application and starts it.
    // - package: builds the extension in release mode and creates the final ZXP package.
    profile: 'debug',

    // Staging folder
    // Used by grunt-cep as a temporary folder for builds and packaging
    staging: 'staging',

    // Source folder
    // Input folder containing extension files such as HTML and ExtendScript files
    source: 'src',

    // Extension
    // Information about the extension used to fill in file templates, etc.
    extension: {
        // Extension version number (format: X.X.X)
        version: '0.1.0',

        // Unique identifier for the extension (used by Creative Cloud and Extension Manager)
        // Usually provided in a form like "com.developer_name.extension_name"
        id: '',

        // Extension name to display in the panel's header and when installing the extension
        name: '',

        // Author or company name
        author_name: '',

        // Extension root file
        mainPath: '',

        // Extension ExtendScript root file
        scriptPath: '',

        // URL that contains extension XML update file and packages
        // Extension Manager will check for extension updates at '%update_url/update.xml'
        // and automatically download the updated package from '%update_url/%name_%version.zxp'
        update_url: '',

        // Description of the extension (HTML)
        // This is only displayed if an URL is not entered in 'description_href' 
        description: '',

        // A URL that points to a HTML file containing the description displayed in the Extension
        // Manager when the extension is selected. If provided 'description' is not used
        description_href: '',

        // Description of how to access the extension, displayed in Extension Manager (supports HTML markup)
        ui_access: '',

        // License agreement shown when installing the extension (supports HTML markup)
        license_agreement: '',

        // Extension icons. Each icon should be a 23x23px PNG.
        icons: {
            // Extension icon, used in Extension Manager
            mxi: 'extension/icon-mxi.png',

            // Panel icons
            panel: {
                light: {
                    normal: 'extension/panel-icons/icon-light.png',
                    hover: 'extension/panel-icons/icon-light-hover.png',
                    disabled: 'extension/panel-icons/icon-light-disabled.png'
                },
                dark: {
                    normal: 'extension/panel-icons/icon-dark.png',
                    hover: 'extension/panel-icons/icon-dark-hover.png',
                    disabled: 'extension/panel-icons/icon-dark-disabled.png'
                },
            },
        },

        // Panel dimensions (in pixels)
        size: {
            normal: { width: 320, height: 400 },
            min: { width: 320, height: 300 },
            max: { width: 800, height: 2400 },
        },
    },

    // Builds
    // A list of individual builds that should be executed, each one
    // resulting in a single .zxp that will be bundle in the final *.zxp 
    // installer. This is useful for custom configuration by product.
    // Each object in this list extends the main project configuration,
    // giving you the ability to override base configuration values.
    builds: [
        {
            // Manifest file template
            manifest: 'manifest.cc.xml',

            // Supported products
            products: [],

            // Currently unused. Supported product families
            families: ['CC'],
        },
    ],

    // Launch
    // Options used to launch debug in host application
    launch: {
        // Host application to launch, defaults to the first one
        // specified in the first build of the 'builds' array
        product: '',

        // Currently unused
        family: 'CC',
    },

    // Package
    // Options related to extension packaging and distribution
    'package': {
        // MXI file template
        mxi: 'extension/template.mxi',

        // Certificate used to sign the extension package
        certificate: {
            // Certificate file
            file: 'extension/certificate.p12',

            // Certificate password
            password: 'example_password',
        },

        // Automatic update setup
        update: {
            // Update.xml file template
            file: 'extension/update.xml',

            // Folder containing changelog files
            changelog_folder: 'extension/changelogs',

            // Changelog file extension
            changelog_extension: '.txt',
        },
    },
};