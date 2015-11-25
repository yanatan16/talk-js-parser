// AST Wrapping Functions



exports.wrapExpressionStatement = function (expr) {
    return {
        type: 'ExpressionStatement',
        expression: expr
    }
}

const makeLiteral = exports.makeLiteral = function (val, raw) {
    return {
        type: 'Literal',
        value: val,
        raw: raw
    }
}

exports.wrapPrefixUnaryExpression = function (args) {
    var op = args[0], arg = args[1]
    return {
        type: 'UnaryExpression',
        operator: op,
        argument: arg,
        prefix: true
    }
}

exports.wrapArrayExpression = function (els) {
    return {
        type: 'ArrayExpression',
        elements: els
    }
}

exports.wrapProperty = function (prop) {
    var key = prop[0], val = prop[1]
    return {
        type: 'Property',
        key: key,
        computed: false,
        value: val,
        kind: 'init',
        method: false,
        shorthand: false
    }
}

exports.wrapObjectExpression = function (props) {
    return {
        type: 'ObjectExpression',
        properties: props
    }
}

exports.nullLiteral = makeLiteral(null, 'null')
exports.trueLiteral = makeLiteral(true, 'true')
exports.falseLiteral = makeLiteral(false, 'false')
