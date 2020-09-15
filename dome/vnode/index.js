function createCompileToFunctionFn(compile){
    return function compileToFunctions (template, options){
        compile(template, options)
    }
}

function createCompilerCreator(baseCompile){
    return function createCompiler (baseOptions){
        function compile(template,  options){
            var finalOptions = Object.create(baseOptions);
            if(options){
                for (var key in options) {
                    finalOptions[key] = options[key];
                }
            }
            console.log(finalOptions, '======compile========')
            var compiled = baseCompile(template.trim(), finalOptions);
            return compiled
        }

        return {
            compile: compile,
            compileToFunctions: createCompileToFunctionFn(compile)
          }
    }
}

function parseHTML(html, options){

}

function parse(template,  options){
    var root;
    parseHTML(template, {

    })
    return root
}

var createCompiler = createCompilerCreator(function baseCompile(template,  options){
    var ast = parse(template.trim(), options);
    return {
        ast: ast,
        options: options
    }
})

var ref$1 = createCompiler({
    baseOptions: 'baseOptions'
});
var compile = ref$1.compile;
var compileToFunctions = ref$1.compileToFunctions;

compileToFunctions(
    ' <div>{{txt}}</div> ',
    {
        delimiters: ' delimiters',
        comments: 'comments'
    }
)
