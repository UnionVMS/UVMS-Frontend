+

#### Fresh install ####

In order to setup a working development environment you can follow these steps.

1. First off you would need a better commandprompt then shipped with win.
Cmder is a lightweight console emulator that fills our need but you can use one of your choosing.
Go to http://bliker.github.io/cmder/
Download and install

2. go to yeoman.io and follwo the installation instructions there. In short you need to install Nodejs, npm (which comes bundled with nodejs) and git to install yeoman.

3. Nodejs,	a:	Go to http://nodejs.org
		b:	Download and install nodejs.
		c:	Verify installation in cmder by typing node --version && npm --version, a version number for should appear for node and npm in the console.

4. Git		a:	Go to http://git-scm.com/
		b:	download and install git
		c: 	Verify installation by typing git --version


5.Once you�ve got Node installed, install the Yeoman toolset with the command:
npm install --global yo bower grunt-cli

6. Verify installation by typing:
yo --version && bower --version && grunt --version

7. Running the above should output three separate version numbers:
Yeoman, Bower, Grunt CLI (the command-line interface for Grunt)


GENERATOR
https://github.com/cgross/generator-cg-angular

generator-cg-angular - This generator follows the Angular Best Practice Guidelines for Project Structure.

npm install -g generator-cg-angular


You can now either create a new project or in this case use svn to download our checked in project. (see steps below).



#### Developed earlier, eg use this steps when yeoman, bower, grunt ets is installed ####
Prerequisities see below.

(Yeoman, optional) Node.js and git.
yo --version && bower --version && grunt --version
Running the above should output three separate version numbers: Yeoman, Bower, Grunt CLI (the command-line interface for Grunt)

Steps:
1 Create projekt folder
2 Download project from SVN to this newly created folder
3 Navigate to this folder
4 run npm install
5 run bower install
6 run grunt build
7 run grunt serve


Prerequisities
Already installed:
* (Yeoman, optional) Node.js and git.
* generator-cg-angular https://github.com/cgross/generator-cg-angular

Verify installation by typing: yo --version && bower --version && grunt --version
Running the above should output three separate version numbers: Yeoman, Bower, Grunt CLI (the command-line interface for Grunt)



To create a new project:
1. mkdir MyNewAwesomeApp
2. cd MyNewAwesomeApp
3. yo cg-angular





FIX:
======================================

If error when running npm install:
...
npm ERR! phantomjs@1.9.15 install: `node install.js`
npm ERR! Exit status 1
...


Go to
C:\Users\[user]\AppData\Local\Temp
and rename or remove phantomjs folder.


more info
https://github.com/Medium/phantomjs/issues/284





Commands
======================================
grunt serve
grunt test
grunt build

Subgenerators
(In app folder you can run this commands)
yo cg-angular:directive my-awesome-directive
yo cg-angular:partial my-partial
yo cg-angular:service my-service
yo cg-angular:filter my-filter
yo cg-angular:module my-module
yo cg-angular:modal my-modal


