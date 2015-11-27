const Parsimmon = require('parsimmon'),
      optWhitespace = Parsimmon.optWhitespace,
      lazy = Parsimmon.lazy,
      regex = Parsimmon.regex,
      string = Parsimmon.string,
      alt = Parsimmon.alt

module.exports = function parse(raw) {
    return form.parse(raw)
}

const ignore = regex(/(\s*(;[^\n]*(\n\s*|$))?)*/)
function lexeme(p) { return p.skip(ignore) }

const lparen = lexeme(string('(')),
      rparen = lexeme(string(')')),
      symbol = lexeme(regex(/[a-z-_][a-z0-9-_]*/i))
      quoted = lexeme(regex(/"([^"]*)"/, 1)),
      numeral = lexeme(regex(/\d+(\.\d+)?/))

const form = lazy('a lisp form', function () {
    return alt(
        sexp,
        symbolForm,
        stringLiteral,
        numberLiteral)
})

const sexp = lparen.then(form.many()).skip(rparen).
          desc('an s-expression'),
      stringLiteral = quoted,
      numberLiteral = numeral.map(parseFloat),
      symbolForm = symbol.map(function (x) { return { sym: x }})
