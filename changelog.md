# Changelog

## 0.7.1:

* Fixed CC 2021 Mac binary paths.

## 0.7.0:

* Added support for CC2021.
* Updated dependencies to latest versions.

Thanks to *chadsaun* for contributing to this version.

## 0.6.1:

* Fixed not being able to launch Adobe Illustrator 2020 on Mac.

Thanks to *chadsaun* for contributing this fix.

## 0.6.0:

* Added support for CC2020.
* Fixed Animate CC2019 application executable.
* Updated dependencies to latest versions.

Thanks to *alebianco-doxee* and *Lilipi* for contributing to this version.

## 0.5.0:

* Added support for CC2019.
* Updated dependencies to the latest versions.

Thanks to *Lilipi* for contributing to this version.

## 0.4.5:

* Fixed CEFCommandLine parameters not being applied to all builds.
* Updated dependencies to the latest available versions.

Thanks to *alebianco* for contributing these changes.

## 0.4.4:

* Fixed extension packaging for Animate CC 2017 and CC 2018.

Thanks to *alebianco* for contributing this fix.

## 0.4.3:

* Added support for CC2018.
* Fixed XML manifest versions to comply with XSD schema released by Adobe.

Thanks to *pcdeshmukh* for contributing to this version.

## 0.4.2:

* Fixed ZXPSignCmd not working on Mac.
* Fixed bundle information not being used to fill in manifest templates.
* Updated dependencies to the latest available versions.

## 0.4.1:

* Added support for CC2017.

Thanks to *barooney* for contributing these changes.

## 0.4.0:

* Added support for CC 2015.5.

## 0.3.5:

* Added support for extension lifecycle configuration (see `extension.lifecycle` in the configuration section below).

## 0.3.4:

* Added support for ZXPSignCmd `-tsa` option (see `package.timestamp_url` in the configuration section below).
* Various bug fixes.

Thanks to *Rhuagh* and *MattMcNam* for contributing fixes and improvements.

Please note: version 0.3.3 was published by mistake and it did not include the ZXPSignCmd binaries. It should NOT be used.

## 0.3.2:

* Improved Premiere support.

Thanks to *Rhuagh* for contributing this fix.

## 0.3.1:

* Improved Mac support.
* Added support for CEF command line parameters and extension type in config (see `extension.cef_params` and `extension.type` in the configuration section below).

Thanks to *MattMcNam* and *jDmacD* for contributing these changes.

## 0.3.0:

* Added support for Adobe Creative Cloud 2015 release.
* Added support for debugging extensions inside multiple host applications at the same time. This required some changes to the way debug ports are assigned to extensions (base port is now *8000* instead than *8080*), see the updated configuration section below if upgrading from a previous version.
* Added experimental support for bundling custom files alongside the extension (see `bundle.files` in the configuration section below).
* Improved Mac support, still not completely working.
* Added preliminary support for After Effects and Dreamweaver.
* Updated dependencies to the latest available versions.

## 0.2.1:

* Added support for packaging multiple extensions in a single extension bundle.
* Added support for Adobe Creative Cloud 2014 release.

**Warning:** contains breaking changes to the task configuration options, see the updated configuration section below if upgrading from a previous version.

## 0.1.2

* Improved changelogs management, bug fixes.

## 0.1.1

* Bug fixes.

## 0.1.0

* First release.
