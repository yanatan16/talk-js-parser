const Parsimmon = require('parsimmon'),
      optWhitespace = Parsimmon.optWhitespace,
      lazy = Parsimmon.lazy,
      regex = Parsimmon.regex,
      string = Parsimmon.string,
      alt = Parsimmon.alt,
      eof = Parsimmon.eof,
      seq = Parsimmon.seq

const util = require('./util'),
      sepBy = require('./parsimmon-util').sepBy

module.exports = function parse(raw) {
    return possiblyEmptyForm.parse(raw)
}

const ignore = regex(/(\s*(;[^\n]*(\n\s*|$))?)*/)
function lexeme(p) { return p.skip(ignore) }

const lparen = lexeme(string('(')),
      rparen = string(')'),
      symbol = regex(/[a-z_][a-z0-9-_]*/i),
      quoted = regex(/"((?:\\.|.)*?)"/, 1),
      numeral = regex(/-?(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i).
          desc('a numeral'),
      space = lexeme(regex(/\s+/))

const form = lazy('a lisp form', function () {
    return alt(        // order of specificity of first char
        sexp,          // begins with (
        stringLiteral, // begins with "
        numberLiteral, // begins with [-.\d]
        symbolForm)    // begins with [a-zA-Z-_]
})

const possiblyEmptyForm = ignore.then(alt(eof.result(undefined), form)).skip(ignore)

const forms = lexeme(sepBy(form, space)),
      sexp = lparen.then(forms).skip(rparen).
          desc('an s-expression'),
      stringLiteral = quoted.map(util.interpretJsonEscapes),
      numberLiteral = numeral.map(parseFloat),
      symbolForm = symbol.map(function (x) { return { sym: x }})
