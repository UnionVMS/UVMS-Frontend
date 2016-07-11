## UnionVMS Web JS documentation

# Fresh install

In order to setup a working development environment you can follow these steps.

1. First off you would need a better commandprompt then shipped with win.
Cmder is a lightweight console emulator that fills our need but you can use one of your choosing.
	* Go to [http://bliker.github.io/cmder/](http://bliker.github.io/cmder/)
	* Download and install

2. Go to [yeoman.io](http://yeoman.io/) and follow the installation instructions there. In short you need to install Nodejs, npm (which comes bundled with nodejs) and git to install yeoman.

	* Nodejs
		* Go to [http://nodejs.org](http://nodejs.org)
		* Download and install nodejs.
		* Verify installation in cmder by typing `node --version && npm --version`, a version number should appear for node and npm in the console.

	* Git
		* Go to [http://git-scm.com/](http://git-scm.com/)
		* download and install git
		* Verify installation by typing `git --version`

3. Once you've got Node installed, install the Yeoman toolset with the command: `npm install --global yo bower grunt-cli`

4. Verify installation by typing: `yo --version && bower --version && grunt --version`

5. Running the above should output three separate version numbers: Yeoman, Bower, Grunt CLI (the command-line interface for Grunt)

6. Install cg-angular generator
	* This [generator](https://github.com/cgross/generator-cg-angular) follows the Angular Best Practice Guidelines for Project Structure.
	* Install with the command: `npm install -g generator-cg-angular`
	* You can now either create a new project or in this case use svn to download our checked in project(see steps below).

# Project Setup
1. Create project folder
2. Download project from SVN to this newly created folder
3. Navigate to this folder and run:
	* `npm install`
	* `bower install`
	* `grunt`
	* `grunt serve`

# Grunt Commands
* Start server: `grunt serve`
* Run tests: `grunt test`
* Build the application: `grunt build`

# cg-angular Subgenerators
In app folder you can run this commands:
* Create a directive: `yo cg-angular:directive my-awesome-directive`
* Create a partial: `yo cg-angular:partial my-partial`
* Create a service: `yo cg-angular:service my-service`
* Create a filter: `yo cg-angular:filter my-filter`
* Create a module: `yo cg-angular:module my-module`
* Create a modal: `yo cg-angular:modal my-modal`


# App client configuration
The **config.json** file is loaded when the application loads, and contains the base
URL for all REST requests (*rest_api_base*). It should be set to the full URL
of the server running the backend components.

Templates for different environments can be found in the environment directory.

The *env_name* property does not do anything, but only displays the name of the
environment in the application footer.


# Contents of the application
* app.full.js - unminified JS
* app.full.min.css - minified CSS styles
* app.full.min.js - minified JS (~ 6 MB)
* app.full.min.js.map - names used for debugging
* assets - fonts, pictures, locales, ...
* config.json = environmetn/*.json
* fonts
* i18n - translations
* index.html - minified HTML
* usm - some USM assets
