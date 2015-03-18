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
  var ignore = ['node_modules','bower_components','dist','temp'];
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
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    connect: {
      main: {
        options: {
          port: 9001
         // base: 'app/'
        }
      }
    },
    watch: {
      main: {
        options: {
            livereload: true,
            livereloadOnError: false,
            spawn: false
        },
        files: [createFolderGlobs(['*.js','*.less','*.html']),'!_SpecRunner.html','!.grunt'],
        tasks: [] //all the tasks are run dynamically during the watch event handler
      }
    },
    jshint: {
      main: {
        options: {
            jshintrc: '.jshintrc'
        },
        src: [createFolderGlobs('*.js'), '!/bower_components/**/*.js']
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
        },
        files: {
          'temp/app.css': 'app/app.less'
        }
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: pkg.name,
            htmlmin:'<%= htmlmin.main.options %>'
        },
        src: [createFolderGlobs('*.html'),'!index.html','!_SpecRunner.html','!app/bower_components/**/*.html' ],
        dest: 'temp/templates.js'
      }
    },
    copy: {
      main: {
        files: [
            {
                src: ['bower_components/font-awesome/fonts/**'], dest: 'dist/',filter:'isFile',expand:true},
            {
                expand:true,
                flatten: true,
                src: ['bower_components/bootstrap/fonts/*'],
                dest: 'dist/fonts/',
                filter:'isFile'
            }, {
                expand:true,
                flatten: true,
                src: ['bower_components/bootstrap/fonts/*'],
                dest: 'fonts/',
                filter:'isFile'
            },
            {
                cwd: 'app/',
                expand:true,
                src: ['assets/**/*'], dest: 'dist/'}
           // {src: ['app/directive/**/*'], dest: 'dist/'},
           // {src: ['app/partial/**/*'], dest: 'dist/'},
           // {src: ['app/service/**/*'], dest: 'dist/'}

          //{src: ['bower_components/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
          //{src: ['bower_components/select2/*.png','bower_components/select2/*.gif'], dest:'dist/css/',flatten:true,expand:true},
          //{src: ['bower_components/angular-mocks/angular-mocks.js'], dest: 'dist/'}
        ]
      }
    },
    dom_munger:{
      read: {
        options: {
          read:[
            {selector:'script[data-concat!="false"]',attribute:'src',writeto:'appjs'},
            {selector:'link[rel="stylesheet"][data-concat!="false"]',attribute:'href',writeto:'appcss'}
          ]
        },
        src: 'app/index.html'
      },
      update: {
        options: {
          remove: ['script[data-remove!="false"]','link[data-remove!="false"]'],
          append: [
            {selector:'body',html:'<script src="app.full.min.js"></script>'},
            {selector:'head',html:'<link rel="stylesheet" href="app.full.min.css">'}
          ]
        },
        src:'app/index.html',
        dest: 'dist/index.html'
      }
    },
    cssmin: {
      main: {
        src:['temp/app.css','<%= dom_munger.data.appcss %>'],
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
        dest: 'temp/app.full.js'
      }
    },
    uglify: {
      main: {
        src: 'temp/app.full.js',
        dest:'dist/app.full.min.js'
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseBooleanAttributes: true,
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
    //Imagemin has issues on Windows.
    //To enable imagemin:
    // - "npm install grunt-contrib-imagemin"
    // - Comment in this section
    // - Add the "imagemin" task after the "htmlmin" task in the build task alias
    // imagemin: {
    //   main:{
    //     files: [{
    //       expand: true, cwd:'dist/',
    //       src:['**/{*.png,*.jpg}'],
    //       dest: 'dist/'
    //     }]
    //   }
    // },


      compress: {
          /*main: {
              options: {
                  archive: 'dist/unionvms-web.zip'
              },
              files: [
                  {src: ['**'], dest: '/'} // includes files in dist
              ]
          },*/
          dist: {
              options: {
                  archive: 'dist/unionvms-web.zip'
              },

              files: [
                  {
                      expand: true,
                      cwd: 'dist/',
                      src: ['**/*'],
                      dest: '/'}
              ]
          }
      }
    //compress: {
	//	dist: {
	//		options: {
	//			archive: 'dist/unionvms-web.zip'
	//		},
    //        files: [
    //            {expand: true, cwd: 'dist/', src: ['**/*'], dest: '/'} // includes files in dist
    //        ]
    //    }
    //}
  });

  grunt.registerTask('build',['jshint','clean:before','less','dom_munger','ngtemplates','cssmin','concat','ngAnnotate','uglify','copy','htmlmin','clean:after','compress:dist']);
  grunt.registerTask('serve', ['dom_munger:read','jshint','connect', 'watch']);

    grunt.event.on('watch', function(action, filepath) {
        //https://github.com/gruntjs/grunt-contrib-watch/issues/156
        if (filepath.lastIndexOf('18n_sv.json') !== -1 && filepath.lastIndexOf('18n_sv.json') === filepath.length - 11) {
            grunt.task.run('merge-json:i18n');
        }

        else if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {

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
                grunt.config('jasmine.unit.options.specs', spec);
                grunt.task.run('jasmine:unit');
            }
        }

        //if index.html changed, we need to reread the <script> tags so our next run of jasmine
        //will have the correct environment
        if (filepath === 'app/index.html') {
            grunt.task.run('dom_munger:read');
        }

    });
};
