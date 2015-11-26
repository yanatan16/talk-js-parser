// AST Wrapping Functions

function makeNode(type, node) {
    node = node || {}
    node.type = type
    return node
}

exports.makeProgram = function (body, source) {
    return makeNode('Program', {
        body: body, sourceType: source
    })
}

exports.wrapEmptyStatement = function () {
    return makeNode('EmptyStatement')
}

exports.wrapExpressionStatement = function (expr) {
    return makeNode('ExpressionStatement', {expression: expr})
}

const makeLiteral = exports.makeLiteral = function (val, raw) {
    return makeNode('Literal', {value: val, raw: raw})
}

exports.wrapPrefixUnaryExpression = function (op_arg) {
    return makeNode('UnaryExpression', {
        operator: op_arg[0],
        argument: op_arg[1],
        prefix: true
    })
}

exports.wrapBinaryExpression = function (arg_op_arg) {
    return makeNode('BinaryExpression', {
        left: arg_op_arg[0],
        operator: arg_op_arg[1],
        right: arg_op_arg[2]
    })
}

exports.wrapArrayExpression = function (els) {
    return makeNode('ArrayExpression', {elements: els})
}

exports.wrapProperty = function (prop) {
    var key = prop[0], val = prop[1]
    return makeNode('Property', {
        key: key,
        computed: false,
        value: val,
        kind: 'init',
        method: false,
        shorthand: false
    })
}

exports.wrapObjectExpression = function (props) {
    return makeNode('ObjectExpression', {properties: props})
}

exports.nullLiteral = makeLiteral(null, 'null')
exports.trueLiteral = makeLiteral(true, 'true')
exports.falseLiteral = makeLiteral(false, 'false')
