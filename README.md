# grunt-cep
> A Grunt plugin that helps debugging and packaging HTML5-based extensions for Adobe Creative Cloud applications.

By using this task you can debug and package HTML5-based extensions for Adobe&reg; Creative Cloud&reg; products directly from Grunt, in a totally automated manner and without the Adobe Extension Builder plugin.

The tool can automatically generate self-signed certificates for extension packaging and automates some error-prone tasks such as bundle and extension manifest files creation. It supports hybrid extensions and lets you create different builds of an extension bundle based on targeted Adobe products.

It is based on the `csxs` command line tool by [Creative Market](https://github.com/creativemarket/csxs).

**Please note:** the plugin is currently in alpha stage and may contain bugs. Options are not freezed and may change in future versions.

## Changelog
### Latest Version
**0.3.0**:

* Added support for Adobe Creative Cloud 2015 release.
* Added support for debugging extensions inside multiple host applications at the same time. This required some changes to the way debug ports are assigned to extensions (base port is now *8000* instead than *8080*), see the updated configuration section below if upgrading from a previous version.
* Added experimental support for bundling custom files alongside the extension (see `bundle.files` in the configuration section below).
* Improved Mac support, still not completely working.
* Added preliminary support for After Effects and Dreamweaver.
* Updated dependencies to the latest available versions.

This release does not contain breaking changes to the API.

### Previous Releases
**0.2.1**:

* Added support for packaging multiple extensions in a single extension bundle.
* Added support for Adobe Creative Cloud 2014 release.

**Warning:** contains breaking changes to the task configuration options, see the updated configuration section below if upgrading from a previous version.

**0.1.2**

* Improved changelogs management, bug fixes.

**0.1.1**

* Bug fixes.

**0.1.0**

* First release.

## Getting Started
This plugin requires Grunt `~0.4.5`. Please refer to the [official documentation](http://gruntjs.com/getting-started) to get started with Grunt. You may install this plugin with this command:

```shell
npm install grunt-cep --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile as usual:

```js
grunt.loadNpmTasks('grunt-cep');
```

### Project Boilerplate
You can use the [_grunt-init-cep_](https://github.com/fcamarlinghi/grunt-init-cep) template to easily get started. The template tool will install all the required files automatically and provide you with a basic extension boilerplate, already configured to run inside the chosen target applications.

Please refer to the [_grunt-init-cep_](https://github.com/fcamarlinghi/grunt-init-cep) documentation for installation and usage instruction.

### Advanced Setup
Bundle icon, manifest, MXI and `update.xml` files provided by the template can also be found in the `res/bundle` folder located inside the plugin installation folder. If you prefer, you can manually copy these files instead of using the _grunt-init-cep_ template.

_grunt-cep_ is setup to use these files by default, so just copy the `res/bundle` folder to the root of your project (that is, the same folder of your `Gruntfile.js`) and you should be good to go.

#### Custom Manifest, XML and MXI Files
XML and MXI template files are populated at build time using configuration properties. For most extensions the provided templates should work just fine, but for complex extensions it might be necessary to make changes to these files or even provide custom ones.

Note that _grunt-cep_ makes no assumptions about and does no validation on extension files content, so be sure to provide valid files and to modify extension configuration accordingly.

## The _cep_ Task
You may run the task with this command:

```shell
grunt cep
```

### Options
_grunt-cep_ has several options that you can customize to fit your needs. To avoid cluttering your `Gruntfile.js` it is more advisable to keep the options in an external Javascript or JSON file for easier editing and import them at run-time using either:

```js
require('cep-config.js');
```

or:

```js
grunt.file.readJSON('cep-config.json');
```

Options defined in the external file can be overwritten in child tasks as needed (see the example below). Default values and a more in-depth description for all the properties below can be found in the <code>/options/defaults.js</code> file in the plugin installation folder.

#### options
These properties define base task options.

<table width="100%">
	<tr>
		<td valign="top" width="140px"><strong>profile</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top"><p>The active build profile. Valid properties include:<p>
		    <ul>
		        <li><p><code>debug</code>: builds the extension in debug mode, that includes files such as <code>.debug</code> for remote extension debugging.</p><p><b>Please note:</b> when building using the <code>debug</code> profile a <code>.debug</code> suffix is automatically added to the name and id of the extension.</p></li>
		        <li><code>launch</code>: builds the extension in debug mode as above, but also installs it into the host application <code>extensions</code> folder and starts the host application.</li>
		        <li><code>package</code>: compiles all the extension builds (see below) in release mode and creates the final <i>.ZXP</i> package ready for distribution.</li>
		    </ul>
		</td>
	</tr>
	<tr>
		<td valign="top"><strong>staging</strong></td>
		<td valign="top">String</td>
		<td valign="top">Path of the temporary folder that the plugin should use when building and packaging the extension. The results of the build can be found in this folder. It should be excluded from source control.</td>
	</tr>
	<tr>
		<td valign="top"><strong>source</strong></td>
		<td valign="top">String</td>
		<td valign="top"><p>Path to the input folder containing extension files such as HTML and ExtendScript files that the plugin should compile for debugging and packaging.</p><p>This can either be a folder containing raw source files or the result of the automated build process when using other Grunt plugins such as <i>grunt-contrib-requirejs</i></p></td>
	</tr>
</table>

#### options.bundle
Contains information about the extension bundle, that is the [container](http://www.adobe.com/devnet/creativesuite/articles/multiple-extensions.html) for all the extensions specified below. If required data is not specified here, _grunt-cep_ will try to load it from the firstextension specified in the `cep.extensions` array.


<table width="100%">
	<tr>
		<td valign="top" width="140px"><strong>version</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Bundle version number (format: <code>X.X.X</code>).</td>
	</tr>
	<tr>
		<td valign="top"><strong>id</strong></td>
		<td valign="top">String</td>
		<td valign="top">Unique identifier for the bundle (used by Creative Cloud and Extension Manager). Usually provided in a form like <code>com.developer_name.bundle_name</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>name</strong></td>
		<td valign="top">String</td>
		<td valign="top">Bundle name, displayed in Extension Manager.</td>
	</tr>
	<tr>
		<td valign="top"><strong>author_name</strong></td>
		<td valign="top">String</td>
		<td valign="top">Author or company name.</td>
	</tr>
	<tr>
		<td valign="top"><strong>mxi_icon</strong></td>
		<td valign="top">Object</td>
		<td valign="top">Bundle icon, displayed in Extension Manager. Icon should be a 23x23px PNG.</td>
	</tr>
	<tr>
		<td valign="top"><strong>update_url</strong></td>
		<td valign="top">String</td>
		<td valign="top">URL that contains extension XML update file and packages. Extension Manager will check for extension updates at <code>{update_url}/update.xml</code> and automatically download the updated package from <code>{update_url}/{name}_{version}.zxp</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>description</strong></td>
		<td valign="top">String</td>
		<td valign="top">Description of the extension to display in the Extension Manager (supports HTML markup). This is only displayed if an URL is not entered in the <code>description_href</code> property.</td>
	</tr>
	<tr>
		<td valign="top"><strong>description_href</strong></td>
		<td valign="top">String</td>
		<td valign="top">A URL that points to a HTML file containing the description displayed in the Extension Manager when the extension bundle is selected. If provided <code>description</code> is not used.</td>
	</tr>
	<tr>
		<td valign="top"><strong>ui_access</strong></td>
		<td valign="top">String</td>
		<td valign="top">Description of how to access the extension, displayed in Extension Manager (supports HTML markup).</td>
	</tr>
	<tr>
		<td valign="top"><strong>license_agreement</strong></td>
		<td valign="top">String</td>
		<td valign="top">License agreement shown when installing the extension (supports HTML).</td>
	</tr>
	<tr>
		<td valign="top" width="140px"><strong>manifest</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Bundle manifest file template, filled in at run-time with bundle information. You can one of the provided manifests (i.e. <code>bundle/manifest.bundle.cc.xml</code>) or provide your own. This is usually better specified in the <strong>builds</strong> array to allow per-product configuration (see example below).</td>
	</tr>
	<tr>
		<td valign="top" width="140px"><strong>files</strong></td>
		<td valign="top" width="50px">Array</td>
		<td valign="top">Since 0.3.0 - A list of additional files that will be added to the extension bundle. This is passed directly to Grunt and supports Grunt's <i>Compact</i> and <i>Files Array</i> formats. See <a href="http://gruntjs.com/configuring-tasks#files">Grunt documentation</a> for additional information. </td>
	</tr>
</table>

#### options.extensions
An array containing information about each single extension that will be added to the bundle. Each extension object holds information such as extension name, author, version, etc. The properties defined here are used to fill in manifest and other extension related file templates.

<table width="100%">
	<tr>
		<td valign="top" width="140px"><strong>version</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Extension version number (format: <code>X.X.X</code>).</td>
	</tr>
	<tr>
		<td valign="top"><strong>id</strong></td>
		<td valign="top">String</td>
		<td valign="top">Unique identifier for the extension (used by Creative Cloud and Extension Manager). Usually provided in a form like <code>com.developer_name.bundle_name.extension_name</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>name</strong></td>
		<td valign="top">String</td>
		<td valign="top">Extension name displayed in the panel's header.</td>
	</tr>
	<tr>
		<td valign="top"><strong>main_path</strong></td>
		<td valign="top">String</td>
		<td valign="top">The extension entry point, usually <code>index.html</code> or similar.</td>
	</tr>
	<tr>
		<td valign="top"><strong>script_path</strong></td>
		<td valign="top">String</td>
		<td valign="top">Main ExtendScript file for the extension.</td>
	</tr>
	<tr>
		<td valign="top"><strong>icons</strong></td>
		<td valign="top">Object</td>
		<td valign="top">Extension icons, each icon should be a 23x23px PNG. Check the default values in the <code>/options/defaults.js</code> source file for a full description of the object.</td>
	</tr>
	<tr>
		<td valign="top"><strong>size</strong></td>
		<td valign="top">Object</td>
		<td valign="top">Panel dimensions (in pixels). Check the default values in the <code>/options/defaults.js</code> source file for a full description of the object.</td>
	</tr>
	<tr>
		<td valign="top" width="140px"><strong>manifest</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Extension manifest file template, filled in at run-time with extension information.  You can one of the provided manifests (i.e. <code>bundle/manifest.extension.xml</code>) or provide your own. This is usually better specified in the <strong>builds</strong> array to allow per-product configuration (see example below).</td>
	</tr>
</table>

#### options.builds
The ability to specify single builds is one of the most powerful feature of _grunt-cep_ when dealing with complex extension bundles.

The `cep.builds` property is an array of objects describing the various builds that should be executed, each one resulting in a separate _ZXP_ file that will be bundled with the final _ZXP_ installer.

Each build object contains the following properties and extends the main task configuration, giving you the ability to override base configuration values on a per-build basis.

<table width="100%">
	<tr>
		<td valign="top"><strong>products</strong></td>
		<td valign="top">Array</td>
		<td valign="top">An array of strings containing the name of the products targeted by this build. Valid product names include: <code>photoshop</code>, <code>illustrator</code>, <code>indesign</code>, <code>flash</code>, <code>dreamweaver</code>, <code>premiere</code>, <code>prelude</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>families</strong></td>
		<td valign="top">Array</td>
		<td valign="top">An array of strings containing the name of the product families targeted by this build. This can be useful to make sure an extension works across different Adobe Creative Cloud releases. Valid family names include: <code>CC</code>, <code>CC2014</code>.</td>
	</tr>
</table>

#### options.launch
Only used when the <code>launch</code> profile is active, holds information needed to launch a target host application.

<table width="100%">
	<tr>
		<td valign="top" width="140px"><strong>product</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Host application to launch for debugging, defaults to the first one specified in the first build of the 'builds' array. Valid values are the same of <code>builds.products</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>family</strong></td>
		<td valign="top">String</td>
		<td valign="top">Version of the host application to use for debugging, useful to test the extension in different releases of the same Adobe Creative Cloud application (i.e. while upgrading an extension from Adobe Photoshop CC to Adobe Photoshop CC 2014). If not specified, falls back to the first family specified in the current <strong>build</strong>. Valid family names include: <code>CC</code>, <code>CC2014</code>.</td>
	</tr>
	<tr>
		<td valign="top"><strong>host_port</strong></td>
		<td valign="top">Number</td>
		<td valign="top">
			<p>Default host port used for debug.</p>
			<p>In order to support debugging an extension inside multiple products at the same time, each supported product will have an unique debug port assigned:</p>
			<ul>
				<li><strong>Photoshop</strong>: 8000</li>
				<li><strong>Illustrator</strong>: 8001</li>
				<li>Etc. For a complete list, see the <code>.debug</code> file.</li>
			</ul>
			<p>If bundling multiple extensions, each extension will have its debug port incremented by 100 (i.e. 8000, 8100, 8200, etc.)</p>
		</td>
	</tr>
</table>

#### options.package
Only used with the <code>package</code> profile, holds information related to bundle packaging and distribution.

<table width="100%">
	<tr>
		<td valign="top" width="140px"><strong>mxi</strong></td>
		<td valign="top" width="50px">String</td>
		<td valign="top">Path to the MXI file template for this bundle. You can use the provided manifest template (<code>bundle/template.mxi</code>) or provide your own.</td>
	</tr>
	<tr>
		<td valign="top"><strong>certificate</strong></td>
		<td valign="top">Object</td>
		<td valign="top"><p>Holds information about the certificate used to sign the extension It has two sub-properties:</p>
		<ul>
		    <li><strong>file</strong> (String): path to the certificate file. If a valid certificate is not found at the specified location, a self-signed one is automatically generated using the password below.</li>
		    <li><strong>password</strong> (String): certificate password.</li>
		</ul>
		</td>
	</tr>
	<tr>
		<td valign="top"><strong>update</strong></td>
		<td valign="top">Object</td>
		<td valign="top"><p>When packaging an extension bundle, the task tries to find a changelog file named as the current extension version (<code>x.x.x.txt</code>) in the <code>changelog_folder</code> folder. This file is used to fill in the <code>update.xml</code> template file which can be used to support automatic updates for your extension through the Adobe Extension Manager CC application.</p>
		<ul>
		    <li><strong>file</strong> (String): path to the <code>update.xml</code> file template (see below).</li>
		    <li><strong>changelog_folder</strong> (String): path to the folder containing changelog files.</li>
		    <li><strong>changelog_extension</strong> (String): changelog files extension.</li>
		</ul>
		</td>
	</tr>
</table>

## Usage Examples
The example configuration below is based on the [_grunt-init-cep_](https://github.com/fcamarlinghi/grunt-init-cep) project template and defines an extension for Adobe Photoshop CC. It registers two tasks (`debug` and `release`) which respectively launch debug inside Adobe Photoshop CC and package the full extension.

All the icons and file templates referenced in the configuration are available in the project template (see the Getting Started section).

```javascript
// cep-config.js
module.exports =
{
    bundle: {
        version: '0.1.0',
        id: 'com.foo.exampleBundle',
        name: 'Example Bundle',
        author_name: 'Foo',
        mxi_icon: 'bundle/icon-mxi.png',
    },
    
    extensions: [{
        version: '0.1.0',
        id: 'com.foo.exampleBundle.examplePanel',
        name: 'Example Panel',
        author_name: 'Foo',
        icons: {
            panel: {
                light: {
                    normal: 'icons/icon-light.png',
                    hover: 'icons/icon-light-hover.png',
                    disabled: 'icons/icon-light-disabled.png'
                },
                dark: {
                    normal: 'icons/icon-dark.png',
                    hover: 'icons/icon-dark-hover.png',
                    disabled: 'icons/icon-dark-disabled.png'
                },
            }
        },
        size: {
            normal: { width: 320, height: 440 },
            min: { width: 320, height: 440 },
            max: { width: 600, height: 600 },
        },
        main_path: 'example.html',
        script_path: 'extendscript/example.jsx',
    }],

    builds: [
        // Adobe Photoshop CC
        {
            bundle: { manifest: 'bundle/manifest.bundle.cc.xml' },
            extensions: [{ manifest: 'bundle/manifest.extension.xml' }],
            products: ['photoshop'],
            source: 'src',
        },
    ],

    'package': {
        certificate: {
            password: 'example_password',
        }
    },
};
```

```javascript
// Grunfile.js
grunt.initConfig({

    // ...

    cep: {
        options: require('./cep-config.js'),

        debug: {
            options: { 
                profile: 'launch',
                launch: {
                    product: 'photoshop',
                },
            }
        },

        release: {
            options: { profile: 'package' }
        },
    },

    // ...
    
});
```
By running: 
```shell
grunt cep:debug
```
_grunt-cep_ will compile all the files in the `src` folders along with other extension files, install the resulting extension and launch Photoshop for testing.

If you want to package the Example extension just run:
```shell
grunt cep:release
```
and a compiled _.ZXP_ file will be created in the `staging` folder.

### Automatic Deploying
Something that I find particularly useful is the ability to automatically deploy the compiled extension to a website. This can be easily achieved using the `grunt-ftp-deploy` plugin:

```javascript
grunt.initConfig({
	// grunt-cep
	cep: {
		// Your config here...
	},

	// FTP deploy
	"ftp-deploy": {
		release: {
			auth: {
				host: 'foo.it',
				port: 21,
				authKey: 'foo'
			},
			src: 'staging',
			dest: '/release',
			exclusions: ['debug', 'package', 'release'] // Exclude work directories
		},
	},
});

// Load plugins
grunt.loadNpmTasks('grunt-cep');
grunt.loadNpmTasks('grunt-ftp-deploy');

// Integrated packaging and deploying
grunt.registerTask('deploy', ['cep:release', 'ftp-deploy:release']);
```

When the `deploy` task is run, the `cep:release` task will package your extension and `ftp-deploy` will upload the relevant files (ZXP installer and "update.xml") to the `foo.it` website.

## Contributing
Contributions are extremely welcome! Extension development for Adobe applications is a complex subject and has a lot of scarcely documented features and issues. Feel free to file issues or contribute fixes to code or documentation.

## License
Copyright &copy; 2014 Francesco Camarlinghi

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

### Copyrights & Trademarks
Based on code created by [Creative Market](https://creativemarket.com).
The included binaries are [copyright](http://labs.adobe.com/downloads/extensionbuilder3.html) Adobe Systems Incorporated. "Creative Suite" and "Creative Cloud" are registered trademarks of Adobe Systems Incorporated.
