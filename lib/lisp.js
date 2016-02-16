const P = require('parsimmon'),
      optWhitespace = P.optWhitespace,
      lazy = P.lazy,
      regex = P.regex,
      string = P.string,
      alt = P.alt,
      eof = P.eof,
      seq = P.seq,
      sepBy = P.sepBy

const util = require('./util')

module.exports = function parse(raw) {
    return possiblyEmptyForm.parse(raw)
}

const ignore = regex(/(\s*(;[^\n]*(\n\s*|$))?)*/)
function lexeme(p) { return p.skip(ignore) }

const lparen = lexeme(string('(')),
      rparen = lexeme(string(')')),
      symbol = regex(/[a-z_][a-z0-9-_]*/i),
      quoted = regex(/"((?:\\.|.)*?)"/, 1),
      numeral = regex(/-?(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i).
          desc('a numeral')

const form = lazy('a lisp form', function () {
    return alt(        // order of specificity of first char
        sexp,          // begins with (
        stringLiteral, // begins with "
        numberLiteral, // begins with [-.\d]
        symbolForm)    // begins with [a-zA-Z-_]
})

const possiblyEmptyForm = ignore.then(alt(eof.result(undefined), form)).skip(ignore)

const forms = lexeme(form).many()
      sexp = lparen.then(forms).skip(rparen).
          desc('an s-expression'),
      stringLiteral = quoted.map(util.interpretJsonEscapes),
      numberLiteral = numeral.map(parseFloat),
      symbolForm = symbol.map(function (x) { return { sym: x }})
