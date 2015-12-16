module.exports = function (grunt) {
    
    grunt.loadNpmTasks('grunt-replace');

    grunt.initConfig({
        replace: {
            environment: {
                options: {
                    patterns: [{
                        json: grunt.file.readJSON('./config/environments/parameters.json')
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['./config/config.js'],
                    dest: './scripts/services/'
                }]
            }
        }
    });
    /**
     * default grunt task
     */
    grunt.registerTask('default', [
        'replace:environment'
    ]);
};
