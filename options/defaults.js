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

'use strict';

// Default extension configuration
module.exports =
{
    /**
     * General settings
     */
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


    /** 
     * Bundle
     * 
     * Contains information about the extension bundle, that is the container
     * for all the extensions specified below.
     * See: http://www.adobe.com/devnet/creativesuite/articles/multiple-extensions.html
     * 
     * If required data is not specified here, grunt-cep will try to load it from the first
     * extension specified in the 'extensions' array.
     */
    bundle: {
        // Bundle version number (format: X.X.X)
        version: null,

        // Unique identifier for the bundle (used by Creative Cloud and Extension Manager)
        // Usually provided in a form like "com.developer_name.bundle_name"
        id: null,

        // Bundle name
        name: null,

        // Author or company name
        author_name: '',

        // Bundle icon, used in Extension Manager. Icon should be a 23x23px PNG.
        mxi_icon: 'bundle/icon-mxi.png',

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

        // Additional files that will be added to the extension bundle
        // This is passed directly to Grunt and supports Grunt's Compact and Files Array formats
        // (see http://gruntjs.com/configuring-tasks#files for additional information)
        files: [],

        // Bundle manifest file template
        manifest: 'bundle/manifest.bundle.cc.xml',
    },


    /** 
     * Extensions
     * 
     * An array containing information about each single extension that will be added
     * to the bundle.
     */
    extensions: [{
        // Extension version number (format: X.X.X)
        version: '0.1.0',

        // Unique identifier for the extension (used by Creative Cloud and Extension Manager)
        // Usually provided in a form like "com.developer_name.bundle_name.extension_name"
        id: '',

        // Name to display in the extension panel's header
        name: '',

        // Extension root file
        main_path: '',

        // Extension ExtendScript root file
        script_path: '',

        // CEF command line parameters
        cef_params: [],

        // Extension type (i.e. "Panel", "ModalDialog", etc.)
        type: 'Panel',

        // Extension lifecycle
        lifecycle: {

            // True to make the extension’s UI visible automatically when launched
            auto_visible: true,

            // A set of events that can start this extension
            events: [],
        },

        // Extension icons. Each icon should be a 23x23px PNG.
        icons: {
            light: {
                normal: '',
                hover: '',
                disabled: '',
            },
            dark: {
                normal: '',
                hover: '',
                disabled: '',
            },
        },

        // Panel dimensions (in pixels)
        size: {
            normal: { width: 320, height: 400 },
            min: { width: 320, height: 300 },
            max: { width: 800, height: 2400 },
        },

        // Extension manifest file template
        manifest: 'bundle/manifest.extension.xml',
    }],


    /** 
     * Builds
     * 
     * A list of individual builds that should be executed, each one
     * resulting in a single .zxp that will be bundled in the final *.zxp 
     * installer. This is useful for custom configuration by product.
     * 
     * Each object in this list extends the main project configuration,
     * giving you the ability to override base configuration values.
     */
    builds: [
        {
            // Bundle
            bundle: {},

            // Extensions
            extensions: [],

            // Supported products
            products: [],

            // Supported product families
            families: [],
        },
    ],


    /** 
     * Launch
     * 
     * Options used to launch debug in host application.
     */
    launch: {
        // Host application to launch, defaults to the first one
        // specified in the first build of the 'builds' array
        product: '',

        // Version of the host application to launch, defaults to the first one
        // specified in the first build of the 'builds' array
        family: '',

        // Default host port used for debug.
        //
        // In order to support debugging an extension inside multiple products at the
        // same time, each supported product will have an unique debug port assigned:
        // - Photoshop: 8000
        // - Illustrator: 8001
        // - InDesign: 8002
        // - Etc. For a complete list, see ".debug" file.
        //
        // If bundling multiple extensions, each extension will have its debug
        // port incremented by 100 (i.e. 8000, 8100, 8200, etc.), see ".debug" file.
        host_port: 8000,
    },



    /** 
     * Package
     * 
     * Options related to bundle packaging and distribution.
     */
    'package': {
        // MXI file template
        mxi: 'bundle/template.mxi',

        // Timestamp server URL
        timestamp_url: '',

        // Certificate used to sign the bundle package
        certificate: {
            // Certificate file
            file: 'bundle/certificate.p12',

            // Certificate password
            password: 'example_password',
        },

        // Automatic update setup
        update: {
            // Update.xml file template
            file: 'bundle/update.xml',

            // Folder containing changelog files
            changelog_folder: 'bundle/changelogs',

            // Changelog file extension
            changelog_extension: '.txt',
        },
    },
};
