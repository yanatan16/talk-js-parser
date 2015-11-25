var Parsimmon = require('parsimmon')

// These functions were just patched into parsimmon and haven't been released
var sepBy = exports.sepBy = function(parser, separator) {
    return sepBy1(parser, separator).or(Parsimmon.of([]));
};

var sepBy1 = exports.sepBy1 = function(parser, separator) {
    var pairs = separator.then(parser).many();

    return parser.chain(function(r) {
        return pairs.map(function(rs) {
            return [r].concat(rs);
        })
    })
};
