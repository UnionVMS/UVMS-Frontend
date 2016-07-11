/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('config', [])

.constant('CFG', {package:{name:'app',version:'0.0.0',devDependencies:{archiver:'^0.12.0',bower:'^1.4.1',grunt:'~0.4.2','grunt-angular-templates':'~0.5','grunt-browser-output':'0.1.0','grunt-cli':'^0.1.13','grunt-connect-proxy':'^0.2.0','grunt-contrib-clean':'~0.5','grunt-contrib-concat':'~0.3','grunt-contrib-connect':'~0.7.1','grunt-contrib-copy':'~0.5','grunt-contrib-cssmin':'~0.7','grunt-contrib-htmlmin':'~0.1','grunt-contrib-jshint':'~0.9','grunt-contrib-less':'~1.0.0','grunt-contrib-uglify':'~0.2','grunt-contrib-watch':'~0.6','grunt-dom-munger':'~3.4','grunt-karma':'~0.8.3','grunt-ng-annotate':'^0.10.0','grunt-ng-constant':'^1.1.0','grunt-protractor-runner':'^2.0.0','grunt-protractor-webdriver':'^0.2.0','grunt-text-replace':'^0.4.0','grunt-war':'^0.4.5','jasmine-spec-reporter':'^1.1.2',karma:'~0.12.6','karma-chrome-launcher':'~0.1.3','karma-firefox-launcher':'~0.1.3','karma-jasmine':'~0.1.5','karma-mocha-reporter':'~0.2.5','karma-phantomjs-launcher':'~0.1.4','load-grunt-tasks':'~0.2',protractor:'^2.1.0'},scripts:{postinstall:'node node_modules/protractor/bin/webdriver-manager update'}},USM:{constantType:'default',languages:null},maven:{},gruntts:'2015-08-18T07:23:44.948Z'})

.constant('ENV', {name:'development'})

.value('debug', true)

;