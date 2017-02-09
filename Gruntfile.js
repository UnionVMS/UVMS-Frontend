/*jslint node: true */
'use strict';

var pkg = require('./package.json');

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, bower_components, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function(fileTypePatterns) {
  fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
  var ignore = ['node_modules','bower_components','dist','temp','node','target', 'testResults'];
  var fs = require('fs');
  return fs.readdirSync(process.cwd())
          .map(function(file){
            if (ignore.indexOf(file) !== -1 ||
                file.indexOf('.') === 0 ||
                !fs.lstatSync(file).isDirectory()) {
              return null;
            } else {
              return fileTypePatterns.map(function(pattern) {
                return file + '/**/' + pattern;
              });
            }
          })
          .filter(function(patterns){
            return patterns;
          })
          .concat(fileTypePatterns);
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;

  var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

  //KARMA TEST FILES
  var karmaFiles = [
      '<%= dom_munger.data.appjs %>',
      'bower_components/angular-mocks/angular-mocks.js',
      'test/envConfigForTest.js',
      {pattern: 'environment/*.json', watched: true, included: false, served: true},
      {pattern: 'app/partial/**/*.html', watched: true, included: false, served: true}
  ];

  // Project configuration.
  grunt.initConfig({
    connect: {
      options: {
        port: 9001,
        keepalive: false
      },
      rules: [
          // Internal rewrite
          {from: 'app/config.json', to: 'environment/local.json'}
      ],
       proxies:grunt.file.exists('proxies.yaml')?grunt.file.readYAML('proxies.yaml'):[{
                context: [
                  '/asset/rest',
                  '/mobileterminal/rest/',
                  '/exchange/rest/',
                  '/movement/rest/',
                  '/movement/activity/',
                  '/exchange/activity/',
                  '/rules/activity/',
                  '/audit/rest/',
                  '/rules/rest/',
                  '/reporting/rest/',
                  '/spatial/rest/',
                  '/spatial/image/',
                  '/config/rest',
                  '/mapfish-print',
                  '/usm-authentication/rest', '/usm-authorisation/rest', '/usm-administration/rest',
                  '/activity/rest'],
              host: 'localhost',
              port: 8080
        },{
            context: '/mock/',
            host: 'localhost',
            port: 8081
        }],

      development: {
          options: {
              middleware: function (connect, options) {
                  var middlewares = [];
                  //Proxy for development
                  middlewares.push(proxy);

                  // RewriteRules support
                  middlewares.push(rewriteRulesSnippet);

                  if (!Array.isArray(options.base)) {
                      options.base = [options.base];
                  }

                  var directory = options.directory || options.base[options.base.length - 1];
                  options.base.forEach(function (base) {
                      // Serve static files.
                      middlewares.push(connect.static(base));
                  });

                  // Make directory browse-able.
                  middlewares.push(connect.directory(directory));

                  return middlewares;
              }
          }
      }
    },
    jsdoc: {
        dist: {
            src: [
                  //SERVICES
                  'app/service/common',
                  'app/service/spatial',
                  'app/service/reporting/',
                  'app/service/areas',
                  'app/service/activity/',

                  //PARTIALS
                  'app/partial/spatial',
                  'app/partial/activity',

                  //DIRECTIVES
                  'app/directive/common/breadcrumbNavigator',
                  'app/directive/activity/',
                  
                  //FILTERS
                  'app/filter/activity/'
            ],
            options: {
                destination: 'dist/docs',
                configure: 'jsdoc_conf.json',
                template: 'node_modules/angular-jsdoc/angular-template',
                readme: './README_docs.md',
                recurse: true
            }
        }
    },
    watch: {
      options: {
          livereload: true,
          livereloadOnError: false,
          spawn: false
      },
      main: {
          files: [createFolderGlobs(['*.js','*.html', '*.css']),'!_SpecRunner.html','!.grunt', '!app/assets/**/*.js'],
          tasks: [], //all the tasks are run dynamically during the watch event handler
      },
      less: {
          files: [createFolderGlobs('*.less')],
          tasks: ['less'],
          options: {
              livereload: false,
              spawn: true
          }
      }
    },
    jshint: {
      main: {
        options: {
            jshintrc: '.jshintrc',
            force: true,
            ignores: ['protractor.conf.js', 'app/**/*-spec.js', 'app/assets/**/*.js', 'bower_components/**/*.js', 'app/**/e2e/*.js','app/**/e2e/**/*.js', 'node_modules/**/*.js']
        },
        src: [createFolderGlobs('*.js')]
      }
    },
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    },
    less: {
      production: {
        options: {
          sourceMap: true,
          sourceMapFilename: 'app/app.css.map',
          sourceMapRootpath: '../'
        },
        files: {
          'app/app.css': 'app/app.less'
        }
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: pkg.name,
            htmlmin:'<%= htmlmin.main.options %>',
            url:    function(url) { return url.replace('app/', ''); }

        },
        src: [createFolderGlobs('*.html'),'!index.html','!_SpecRunner.html','!app/bower_components/**/*.html' ],
        dest: 'temp/templates.js'
      }
    },
    copy: {
      dist: {
        files: [
            {
                cwd: 'bower_components/',
                src: ['font-awesome/fonts/**'],
                dest: 'dist/assets',
                filter:'isFile',
                expand:true
            },
            {
                expand:true,
                flatten: true,
                src: ['bower_components/bootstrap/fonts/*'],
                dest: 'dist/fonts/',
                filter:'isFile'
            },
            {
                expand:true,
                flatten: true,
                src: ['bower_components/bootstrap/fonts/*'],
                dest: 'fonts/',
                filter:'isFile'
            },
            {
                cwd: 'app/',
                expand:true,
                src: ['i18n/**/*'], dest: 'dist/'
            },
            {
                cwd: 'app/',
                expand:true,
                src: ['assets/**/*'], dest: 'dist/'
            },
            {   cwd: 'app/usm',
                expand: true,
                src: ['assets/translate/**/*'],
                dest: 'dist/usm/'
            },
            {
                expand:true,
                flatten: true,
                src: ['bower_components/angular-i18n/*'],
                dest: 'dist/assets/locales',
                filter:'isFile'
            },
            {
                src: ['temp/config.json'],
                dest: 'dist/config.json'
            }
        ]
      },
      config: {
        files: [{
            src: 'environment/general.json',
            dest: 'temp/config.json'
        }]
      },
      configLocal:{
        files: [
            {
                src: 'environment/local.json',
                dest: 'temp/config.json'
            }
        ]
      },
      configDev:{
        files: [
            {
                src: 'environment/dev.json',
                dest: 'temp/config.json'
            }
        ]
      },
      configTest:{
        files: [
            {
                src: 'environment/test.json',
                dest: 'temp/config.json'
            }
        ]
      },
      configCygnus : {
        files: [
            {
                src: 'environment/cygnus.json',
                dest: 'temp/config.json'
            }
        ]
      },
      configMaven : {
        files: [
            {
                src: 'environment/maven.json',
                dest: 'temp/config.json'
            }
        ]
      },
      serve: {
        files: [
            {
                cwd: 'bower_components/',
                src: ['font-awesome/fonts/**'],
                dest: 'app/assets',
                filter:'isFile',
                expand:true
            },
            {
                cwd: 'bower_components/angular-i18n/',
                src: ['*.js'],
                dest: 'app/assets/locales',
                filter:'isFile',
                expand:true
            }
        ]
      }
    },
    dom_munger:{
      read: {
        options: {
          read:[
            {selector:'script[data-concat!="false"]',attribute:'src',writeto:'appjs', isPath: true},
            {selector:'link[rel="stylesheet"][data-concat!="false"]',attribute:'href',writeto:'appcss'}
          ]
        },
        src: 'app/index.html'
      },
      update: {
        options: {
          remove: ['script[data-remove!="false"]','link[data-remove!="false"]'],
          append: [
            {selector:'body',html:'<script src="app.full.min.js?v=' + pkg.version + '"></script>'},
            {selector:'head',html:'<link rel="stylesheet" href="app.full.min.css?v=' + pkg.version +'">'}
          ]
        },
        src:'app/index.html',
        dest: 'dist/index.html'
      }
    },
    cssmin: {
      main: {
        src:['app/app.css','<%= dom_munger.data.appcss %>'],
        dest:'dist/app.full.min.css'
      }
    },
    concat: {
      main: {
        src: ['<%= dom_munger.data.appjs %>','<%= ngtemplates.main.dest %>'],
        dest: 'temp/app.full.js'
      }
    },
    ngAnnotate: {
      main: {
        src:'temp/app.full.js',
        dest: 'dist/app.full.js'
      }
    },
    uglify: {
      main: {
        options: {
          mangle: false,
          beautify: true,
          banner: '/*Version: <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */',
          sourceMap: true
        },
        src: 'dist/app.full.js',
        dest:'dist/app.full.min.js'
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseBooleanAttributes: false,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    htmlhint: {

      html: {
        options: {
          'tag-pair': true
        },
        src: ['app/**/*.html']
      }
    },
    //Karma testing
    karma: {
      options: {
        plugins: [
                'karma-jasmine',
                'karma-phantomjs-launcher',
                'karma-junit-reporter',
                'karma-coverage',
                'karma-mocha-reporter'
        ],
        frameworks: ['jasmine'],
        //browsers: ['PhantomJS', 'Chrome'],
        browsers: ['PhantomJS'],
        browserNoActivityTimeout: 100000,
        proxies:  {
            '/config.json': 'http://localhost:9876/base/environment/local.json',
            '/partial/': 'http://localhost:9876/base/app/partial/'
        },
        logLevel:'INFO',
        reporters:['mocha', 'junit', 'coverage'],
        junitReporter: {
            outputDir: 'testResults',
            outputFile: 'test-results.xml'
        },
        coverageReporter: {
            dir: 'testResults/coverage',
            type: 'html'
        },
        autoWatch: false, //watching is handled by grunt-contrib-watch
        singleRun: true
      },
      //THE FILES ARE SPLITTED IN TO MULTIPLE SUITES TO AVOID PHANTOMJS CRASHING BECAUSE OF MEMORY ISSUES
      controllers: {
        options: {
            files: karmaFiles.concat(['app/partial/**/*-spec.js']),
            junitReporter: {
                outputDir: 'testResults/controllers',
                outputFile: 'controllers.xml',
            },
            preprocessors: {
                'app/partial/**/!(*-spec).js': ['coverage']
            },
            coverageReporter: {
                dir: 'testResults/controllers/coverage',
                type: 'html'
            }
        }
      },
      directives: {
        options: {
            files: karmaFiles.concat(['app/directive/**/*-spec.js', 'temp/templates.js']),
            junitReporter: {
                outputDir: 'testResults/directives',
                outputFile: 'directives.xml'
            },
            preprocessors: {
                'app/directive/**/!(*-spec).js': ['coverage']
            },
            coverageReporter: {
                dir: 'testResults/directives/coverage',
                type: 'html'
            }
        }
      },
      services: {
        options: {
            files: karmaFiles.concat(['app/service/**/*-spec.js']),
            junitReporter: {
                outputDir: 'testResults/services',
                outputFile: 'services.xml'
            },
            preprocessors: {
                'app/service/**/!(*-spec).js': ['coverage']
            },
            coverageReporter: {
                dir: 'testResults/services/coverage',
                type: 'html'
            }
        }
      },
      filters: {
        options: {
            files: karmaFiles.concat(['app/filter/**/*-spec.js']),
            junitReporter: {
                outputDir: 'testResults/filters',
                outputFile: 'filters.xml'
            },
            preprocessors: {
                'app/filter/**/!(*-spec).js': ['coverage']
            },
            coverageReporter: {
                dir: 'testResults/filters/coverage',
                type: 'html'
            }
        }
      },
      during_watch: {
        browsers: ['PhantomJS']
      }
    },
    compress: {
      dist: {
        options: {
          archive: 'dist/unionvms-web.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**/*'],
          dest: '/'}]
      }
    },
    parallel: {
      options: {
        stream: true
      },
      'sub-build': {
        tasks: [{
          grunt: true,
          args: ['htmlhint','jshint']
        }, {
          grunt: true,
          args: ['less','dom_munger','ngtemplates','cssmin','concat','ngAnnotate','uglify','copy:dist','htmlmin','compress:dist','clean:after']
        }]
      },
      serve: {
        tasks: [{
          grunt: true,
          args: ['htmlhint','jshint']
        }, {
          grunt: true,
          args: ['serve-no-watch', 'watch', 'ngtemplates'],
        }]
      }
    },
    ngconstant: {
      options: {
        name: 'debugConfig',
        space: '  '
      },
      development: {
        options: {
          dest: 'app/debugConfig.js'
        },
        constants: {
          DEBUG: true
        }
      },
      production: {
        options: {
          dest: 'app/debugConfig.js'
        },
        constants: {
          DEBUG: false
        }
      }
    }
  });
  
  grunt.registerTask('sub-build',['parallel:sub-build']);//,'clean:after'

  grunt.registerTask('build', ['test', 'ngconstant:production', 'clean:before', 'copy:config', 'sub-build']);
  grunt.registerTask('build-local', ['ngconstant:development', 'test', 'clean:before', 'copy:configLocal', 'test', 'sub-build']);
  grunt.registerTask('build-cygnus', ['ngconstant:development', 'test', 'clean:before', 'copy:configCygnus', 'sub-build']);
  grunt.registerTask('build-maven', ['ngconstant:development', 'test', 'clean:before', 'copy:configMaven', 'sub-build']);
  grunt.registerTask('build-dev', ['ngconstant:development', 'test', 'clean:before', 'copy:configDev','sub-build']);
  grunt.registerTask('build-test', ['ngconstant:development', 'test', 'clean:before', 'copy:configTest','sub-build']);
  grunt.registerTask('test',['ngconstant:development', 'dom_munger:read', 'ngtemplates', 'karma:services', 'karma:controllers', 'karma:directives', 'karma:filters', 'clean:after']);

  grunt.registerTask('default',['build-dev']);
  
  grunt.registerTask('serve-no-watch', ['less', 'dom_munger:read', 'configureProxies', 'configureRewriteRules', 'connect:development']);
  grunt.registerTask('serve', ['parallel:serve']);
  grunt.registerTask('serve-debug', ['ngconstant:development','serve']);
  grunt.registerTask('serve-prod', ['ngconstant:production','serve']);
  grunt.registerTask('serve-copy', ['copy:serve', 'serve']);
  
  grunt.registerTask('build-docs', ['jsdoc']);
  grunt.registerTask('constants', ['ngconstant:development']);
  
    grunt.event.on('watch', function(action, filepath) {
        if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {
    
            //lint the changed js file
            grunt.config('jshint.main.src', filepath);
            grunt.task.run('jshint');
    
            //find the appropriate unit test for the changed file
            var spec = filepath;
            if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
                spec = filepath.substring(0, filepath.length - 3) + '-spec.js';
            }
    
            //if the spec exists then lets run it
            if (grunt.file.exists(spec)) {
                //grunt.config('jasmine.unit.options.specs', spec);
                //grunt.task.run('jasmine:unit');
                //grunt.config('karma.options.files', files);
                var files = [
                    {pattern: 'environment/*.json', watched: true, included: false, served: true},
                    '<%= dom_munger.data.appjs %>',
                    'bower_components/angular-mocks/angular-mocks.js',
                    'test/envConfigForTest.js',
                    spec
                ];
    
                grunt.config('karma.options.files', files);
                grunt.task.run('karma:during_watch');
            }
        }
    
        if (filepath.lastIndexOf('.htm') !== -1 && filepath.lastIndexOf('.htm') >= (filepath.length - 6)) {
            //lint the changed html file
            grunt.config('htmlhint.html.src', filepath);
            grunt.task.run('htmlhint');
        }
    
        //if index.html changed, we need to reread the <script> tags so our next run of jasmine
        //will have the correct environment
        if (filepath === 'app\\index.html') {
            grunt.task.run('dom_munger:read');
        }
    
    });
};
