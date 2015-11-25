// JSON Parser

const Parsimmon = require('parsimmon'),
      regex = Parsimmon.regex, // parse a regex
      string = Parsimmon.string, // parse a string
      seq = Parsimmon.seq, // parse a sequence of parsers
      seqMap = Parsimmon.seqMap, // like seq(a,b,...).map(f)
      alt = Parsimmon.alt, // parse alternatives
      lazy = Parsimmon.lazy, // used for recursion
      sepBy = require('./parsimmon-util').sepBy // parse a parser separated by things

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
      number = lexeme(regex(/-?(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i)).desc('a numeral'),
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

// Literals parse the literal in question and return the actual value
const nullLiteral = null_.result(null), // all null values are `null`
      trueLiteral = true_.result(true),
      falseLiteral = false_.result(false),
      stringLiteral = quoted.map(interpretEscapes),
      numberLiteral = number.map(parseFloat) // parse the string number into a float

const literal = alt(stringLiteral,
                    numberLiteral,
                    trueLiteral,
                    falseLiteral,
                    nullLiteral)

// Objects and arrays
function commaSep(parser) { return sepBy(parser, comma) }

// Arrays are comma separated json objects between brackets
const array = lbrack.then(commaSep(json)).skip(rbrack)

// KVPairs are strings colon and a json object
const kvpair = seq(stringLiteral.skip(colon), json);

// Objects are comma-separated kv pairs between braces
const object = lbrace.then(commaSep(kvpair)).skip(rbrace).map(function (pairs) {
    const out = {}
    pairs.forEach(pair => out[pair[0]] = pair[1])
    return out
})

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
