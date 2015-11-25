// JS Math Parser

const Parsimmon = require('parsimmon'),
      regex = Parsimmon.regex, // parse a regex
      string = Parsimmon.string, // parse a string
      seq = Parsimmon.seq, // parse a sequence of parsers
      seqMap = Parsimmon.seqMap, // like seq(a,b,...).map(f)
      alt = Parsimmon.alt, // parse alternatives
      lazy = Parsimmon.lazy, // used for recursion
      eof = Parsimmon.eof,
      fail = Parsimmon.fail,
      succeed = Parsimmon.succeed,
      optWhitespace = Parsimmon.optWhitespace,
      sepBy = require('./parsimmon-util').sepBy // parse a parser separated by things

const ast = require('./ast')

module.exports = function parse(raw, source) {
    return statements.
        map(function (stmt) { return ast.makeProgram(stmt, source || 'script') }).
        parse(raw)
}

// Whitespace and comments to ignore
const ignore = optWhitespace // TODO add comments

function lexeme(p) { return p.skip(ignore) }

// lexemes
const lparen = lexeme(string('(')),
      rparen = lexeme(string(')')),
      semicolon = lexeme(string(';')),
      minus = lexeme(string("-")),
      plus = lexeme(string('+')),
      number = lexeme(regex(/(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i)).desc('a numeral')

// Forward-declare base parser
const expr = lazy('an expression', function() {
    const exprAlts = alt(parenWrappedExpr,
                         literal,
                         operation)

    // this is complicated because of the recursion
    // involved with binary operations
    return illegalBeginExpr.map(function (r) { return {illegal: true, raw: r} }).
        or(exprAlts).
        chain(function (x) {
            if (x.illegal)
                return fail('Illegal character: ' + x.raw)
            return succeed(x)
        })
})

const exprStatement = expr.skip(semicolon.or(eof)).map(ast.wrapExpressionStatement),
      emptyStatement = semicolon.map(ast.wrapEmptyStatement),
      statement = alt(emptyStatement, exprStatement),
      statements = ignore.then(statement.many())

const parenWrappedExpr = lparen.then(expr).skip(rparen),
      illegalBeginExpr = regex(/[^0-9a-z\-+({\[\/]/i).or(eof)


// *** Literals ***

// Literals parse the literal in question and return the actual value
const numberLiteral = number.map(function (n) {
    return ast.makeLiteral(parseFloat(n), n)
})

const literal = numberLiteral

// *** Operations ***
const operation = lazy('an operation', function () {
    return alt(unaryPrefixOperation,
               binaryOperation)
})

const unaryPrefixOperators = alt(minus, plus),
      unaryPrefixOperation = seq(unaryPrefixOperators, expr).
          map(ast.wrapPrefixUnaryExpression),
      binaryOperators = alt(minus, plus),
      binaryOperation = seq(expr, binaryOperators, expr).
          map(ast.wrapBinaryExpression)