
var typedocs = require("gulp-typedoc");
var gulp = require("gulp")
gulp.task("default", function() {
    return gulp
        .src(["src/lib/*.ts","src/presets/*.ts"])
        .pipe(typedocs({
            
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "Promise-Insist",
            
        }))
    ;
});