# UVMS-Frontend

This AngularJS application is the frontend module for Union VMS.


## Getting Started

Below instructions will get you a copy of the frontend module up and running on your local machine for development and testing purposes.


### Prerequisites

The application is run on node.js please download and install [Node.js v 5.7.1](https://nodejs.org/download/release/v5.7.1/) if a newer version of node already is installed we recommend you to use [nvm](https://github.com/creationix/nvm) to be able to run this version. Verify the version and installation by running `node --version && npm --version`


### Installing

Clone this [repository](https://github.com/UnionVMS/UVMS-Frontend.git) and follow below step by step to get a development environment running.

1. Run below command to install Yeoman, Bower and Grunt to be able to develop, serve and build the application

```
$ npm install --global yo@1.8.5 bower grunt-cli
```

2. Install the [Angular generator](https://github.com/cgross/generator-cg-angular), this is needed to generate new frontend components

```
$ npm install -g generator-cg-angular
```

3. Install bower packages by running below command (specified in the manifest file `bower.json`)

```
$ bower install
```

4. Install npm packages by running below command (specified in the manifest file `package.json`)

```
$ npm install
```

## Grunt tasks

The project is using Grunt as a task runner. The config file with all tasks can be found in `Gruntfile.js`

### Serve the application

A backend environment needs to be present to be able to run the frontend code locally. Please follow the documentation on Focus fish on [how to setup a Docker environment](https://focusfish.atlassian.net/wiki/display/UVMS/Docker+Installation). Please specify the Wildfly port within the Gruntfile.js at connect:proxies, if you follow above guide the port should be set to '28080'.

create a proxies.yaml file if using a docker-machine setup

first make a call to grunt copy:serve to get the angular locale files into the assets

Run below command to serve the application on a web server `http://localhost:9001`

```
$ grunt serve
```

### Running the tests

Running below command will start Mocha tests via Karma-runner. This will also create a coverage report found in `/testResults`.

```
$ grunt test
```

### Build the application

Below command will minify, compress and concatenates the project to only a few highly compressed files found in `/dist`. Kindly note that unit tests will be run before the built files can created.

The build process uses grunt-dom-munger to pull script references from the index.html:

* To prevent a script or stylesheet from being included in concatenation, put a `data-concat="false"` attribute on the link or script tag.

* To prevent a script or link tag from being removed from the finalized `index.html`, use a `data-remove="false"` attribute.

```
$ grunt build-ci
```

To build the application with Maven use below command:
```
clean deploy -DskipTests -Dgrunt.build=$build-ci -U
```


### Documentation

Running below command will render Javascript documentation to `/dist/docs/`. Javascript documentation through [JSDoc](http://usejsdoc.org/) should be added for all components created.
```
$ grunt build-docs
```

## Development and style guide

To generate a new component to the project use Angular Generator with below command depending on the component.
```
$ yo cg-angular:directive my-directive
$ yo cg-angular:partial my-partial
$ yo cg-angular:service my-service
$ yo cg-angular:filter my-filter
```

## Contributing

Please read [Focus Fish - Union VMS Documentation](https://focusfish.atlassian.net/wiki/display/FOC/DRAFT+-+JIRA+and+GitHub+workflow+in+practice) for details on our code of conduct, and the process for submitting pull requests.

## License

Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries © European Union, 2015-2017.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with the IFDM Suite. If not, see http://www.gnu.org/licenses

## Guides

* [User Manual to the application](https://focusfish.atlassian.net/wiki/display/UVMS/Union+VMS+-+User+Manual)
