// JSON AST Parser

const Parsimmon = require('parsimmon'),
      regex = Parsimmon.regex, // parse a regex
      string = Parsimmon.string, // parse a string
      seq = Parsimmon.seq, // parse a sequence of parsers
      seqMap = Parsimmon.seqMap, // like seq(a,b,...).map(f)
      alt = Parsimmon.alt, // parse alternatives
      lazy = Parsimmon.lazy, // used for recursion
      sepBy = require('./parsimmon-util').sepBy // parse a parser separated by things

const ast = require('./ast')

module.exports = function parse(raw) {
    return jsonParser.parse(raw)
}

// Whitespace to ignore
const ignore = regex(/\s*/m)
function lexeme(p) { return p.skip(ignore) }

// lexemes
const lbrace = lexeme(string('{')),
      rbrace = lexeme(string('}')),
      lbrack = lexeme(string('[')),
      rbrack = lexeme(string(']')),
      quoted = lexeme(regex(/"((?:\\.|.)*?)"/, 1))
          .desc('a quoted string'),
      comma = lexeme(string(',')),
      colon = lexeme(string(':')),
      // separate the negation unary operator
      negation = lexeme(string("-")),
      number = lexeme(regex(/(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i)).desc('a numeral'),
      null_ = lexeme(string('null')),
      true_ = lexeme(string('true')),
      false_ = lexeme(string('false'))

// Forward-declare base parser
const json = lazy('a json element', function() {
    return alt(object,
               array,
               literal)
})

const jsonParser = ignore.then(json)
          .map(ast.wrapExpressionStatement)

// Literals parse the literal in question and return the actual value
const nullLiteral = null_.result(ast.nullLiteral), // all null values are `null`
      trueLiteral = true_.result(ast.trueLiteral),
      falseLiteral = false_.result(ast.falseLiteral),
      stringLiteral = quoted.map(s => ast.makeLiteral(interpretEscapes(s),
                                                      '"'+s+'"'))

const numberLiteral = number.map(n => ast.makeLiteral(parseFloat(n), n)),
      unaryOp = seq(negation, numberLiteral).map(ast.wrapPrefixUnaryExpression),
      numberExpr = alt(unaryOp, numberLiteral)

const literal = alt(stringLiteral,
                    trueLiteral,
                    falseLiteral,
                    nullLiteral,
                    numberExpr)

// Objects and arrays
function commaSep(parser) { return sepBy(parser, comma) }

// Arrays are comma separated json objects between brackets
const array = lbrack.then(commaSep(json)).skip(rbrack)
          .map(ast.wrapArrayExpression)

// KVPairs are strings colon and a json object
const kvpair = seq(stringLiteral.skip(colon), json)
          .map(ast.wrapProperty)

// Objects are comma-separated kv pairs between braces
const object = lbrace.then(commaSep(kvpair)).skip(rbrace)
          .map(ast.wrapObjectExpression)

// Map an input json string to an output string
// Interpret any escapes to their actual characters
function interpretEscapes(str) {
    const escapes = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    }

    const ret = str.replace(/\\(u[0-9a-fA-F]{4}|[\\bfnrt"])/g, function(_, escape) {
        var type = escape.charAt(0);
        var hex = escape.slice(1);
        if (type === 'u') return String.fromCharCode(parseInt(hex, 16));
        if (escapes.hasOwnProperty(type)) return escapes[type];
        return type;
    });

    return ret
}
