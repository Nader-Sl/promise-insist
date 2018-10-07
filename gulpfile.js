
var typedocs = require("gulp-typedoc");
var gulp = require("gulp")
gulp.task("default", function() {
    return gulp
        .src(["lib/*.ts","presets/*.ts"])
        .pipe(typedocs({
            
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "Promise-Insist",
            
        }))
    ;
});