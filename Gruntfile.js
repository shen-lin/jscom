module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	
		clean: {
			preprocess: ['dist', 'logs'],
			second: ['logs']
		},
		
		mkdir: {
			preprocess: {
				options: {
					mode: 0700,
					create: ['dist', 'logs']
				},
			},
		},
		
		concat: {
			options: {
				separator: '\n',
			},
			dist: {
				src: ['src/JSCOM.js', 'src/util/String.js', 'src/util/Loader.js',
				'src/util/Error.js', 'src/JSCOMRuntime.js', 'src/Acquisitor.js',
				'src/Interface.js', 'src/Composite.js', 'src/Component.js', 'src/Adaptor.js'],
				dest: 'dist/jscom.js'
			},
		},
	
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		
		copy: {
			main: {
				expand: true,
				cwd: 'src',
				src: 'api/**',
				dest: 'dist/JSCOM/'
			},
		},	
		
		env: {
			dev: {
				NODE_PATH: 'C:/Users/I830561/Development/Github/jscom',
				
				options: {
					push: {
						PATH: {
							value : 'C:/Users/I830561/Development/Github/jscom/node_modules/.bin',
							delimiter: ';' 
						}
					}
				}
			}
		},
		
		shell: {
			getPATH: {
				command: 'echo %PATH%'
			},
			getNODE_PATH: {
				command: 'echo %NODE_PATH%'
			},
			teston: {
				command: 'istanbul cover -i "dist/**" "node_modules/mocha/bin/_mocha"'
			},
			testoff: {
				command: 'echo "testing is turned off"'
			},
			docon: {
				command: 'smartDoc'
			},
			docoff: {
				command: 'echo "doc generation is turned off"'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-mkdir');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-env');

	// Argument options  
	var include_test = grunt.option('test') || 'off'; // --test=on|off
	var include_doc = grunt.option('doc') || 'off'; // --doc=on|off
	
	// Build steps
	grunt.registerTask('default', 'Primary grunt task routine', function(n) {
		grunt.task.run(['clean:preprocess']);
		grunt.task.run(['mkdir:preprocess']);
		grunt.task.run(['concat:dist']);
		grunt.task.run(['uglify:dist']);
		grunt.task.run(['copy:main']);
		grunt.task.run(['env:dev']);
		grunt.task.run(['shell:getPATH', 'shell:getNODE_PATH']);
		grunt.task.run(['shell:test' + include_test]);
		grunt.task.run(['shell:doc' + include_doc]);
	});
};