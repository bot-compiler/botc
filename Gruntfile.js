module.exports = function (grunt) {
    grunt.initConfig({
        // define source files and their destinations
        uglify: {
            build: {
                files: [
                    {
                        src: 'src/DialogFlow/*.js',  // source files mask
                        dest: 'lib/DialogFlow/',    // destination folder
                        expand: true,    // allow dynamic building
                        flatten: true,   // remove all unnecessary nesting
                        ext: '.js'   // replace .js to .min.js
                    },
                    {
                        src: 'src/Machines/CompilerUtils/*.js',  // source files mask
                        dest: 'lib/Machines/CompilerUtils/',    // destination folder
                        expand: true,    // allow dynamic building
                        flatten: true,   // remove all unnecessary nesting
                        ext: '.js'
                    },
                    {
                        src: 'src/Parser/*.js',  // source files mask
                        dest: 'lib/Parser/',    // destination folder
                        expand: true,    // allow dynamic building
                        flatten: true,   // remove all unnecessary nesting
                        ext: '.js'
                    },
                    {
                        src: 'src/Semantic Analyser/*.js',  // source files mask
                        dest: 'lib/Semantic Analyser/',    // destination folder
                        expand: true,    // allow dynamic building
                        flatten: true,   // remove all unnecessary nesting
                        ext: '.js'
                    }
                ]
            },
            options: {
                quoteStyle: 3,
                mangle: true
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src',
                src: ['**', '**/.gitignore', '!**/*.ts'],
                dest: 'lib/',
            },
        },
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // register at least this one task
    grunt.registerTask('default', ['copy', 'uglify']);
};