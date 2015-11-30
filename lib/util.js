// Map an input json string to an output string
// Interpret any escapes to their actual characters
exports.interpretJsonEscapes = function(str) {
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
