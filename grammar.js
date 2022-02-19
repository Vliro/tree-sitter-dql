const

  FILTER_PREC = {
    NOT: 2,
    AND: 1,
    OR: 0
  },
  hexDigit = /[0-9a-fA-F]/,
  octalDigit = /[0-7]/,
  decimalDigit = /[0-9]/,
  binaryDigit = /[01]/,

  hexDigits = seq(hexDigit, repeat(seq(optional('_'), hexDigit))),
  octalDigits = seq(octalDigit, repeat(seq(optional('_'), octalDigit))),
  decimalDigits = seq(decimalDigit, repeat(seq(optional('_'), decimalDigit))),
  binaryDigits = seq(binaryDigit, repeat(seq(optional('_'), binaryDigit))),

  hexLiteral = seq('0', choice('x', 'X'), optional('_'), hexDigits),
  octalLiteral = seq('0', optional(choice('o', 'O')), optional('_'), octalDigits),
  decimalLiteral = choice('0', seq(/[1-9]/, optional(seq(optional('_'), decimalDigits)))),
  binaryLiteral = seq('0', choice('b', 'B'), optional('_'), binaryDigits)
module.exports = grammar({
  name: 'dql',

  inline: $ => [$.function_val],


  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {

    source_file: $ => $.query_root,

    word: $ => $.identifier,

    comment: $ => token(prec(-10, /#.*\n*/)),

    query_root: $ => seq(optional("query"),
      field("name", optional($.identifier)),
      field("args", optional($.query_args)),
      field("query", block(repeat1($.query))),
      field("fragments", repeat($.fragment))),

    query_args: $ => seq('(', commaSep($.query_args_value), ')'),

    query_args_value: $ => seq("$", field("name", $.identifier), ':', field("type", $.identifier), field("value", optional(seq("=", $.interpreted_string_literal)))),

    query: $ => seq(
      field("name", $.identifier), "(", "func", ":",
      field("function", $.function),
      field("page_ord", optional(seq(",", $.page_order))), ")",
      field("filter", optional($.filter)),
      field("directive", repeat($.directive)),
      field("query", block(repeat($.query_line)))),

    query_line: $ => seq(optional(seq(field("alias", $.identifier), ":")), choice(seq(field("variable", $.identifier), choice("as", "AS"), field("value", $.pred_value)), field("value", $.pred_value)),
      field("filter", optional($.filter)), field("groupby", optional($.groupby)), field("page_ord", optional(seq("(", $.page_order, ")"))), field("query", optional(block(repeat($.query_line))))),

    directive: $ => seq("@", field("name", $.identifier), optional(seq("(", field("values", commaSep(seq($.identifier, ":", $.value))), ")"))),

    filter: $ => seq("@filter", "(", repeat1($.filter_expr), ")"),

    filter_expr: $ => choice(
      field("function", $.function),
      $.filter_unary,
      $.filter_binary,
    ),

    fragment: $ => seq("fragment",
      field("name", $.identifier),
      field("values", block(repeat1($.fragment_inner)))),

    fragment_inner: $ =>
      choice(
        seq("...", $.identifier),
        seq($.pred_lit, optional(block($.fragment_inner)))
      ),

    filter_unary: $ => prec.left(3, seq(choice("not", "NOT"), $.filter_expr)),

    filter_binary: $ => choice(
      prec.left(1, seq($.filter_expr, choice("or", "OR"), $.filter_expr)),
      prec.left(2, seq($.filter_expr, choice("and", "AND"), $.filter_expr))),

    facet: $ => seq("@facets", optional("(",), commaSep(choice(
      $.function,
      $.pred_lit,
      seq($.pred_lit, ":", $.pred_lit),
    ))),

    page_order: $ => commaSep1(
      choice(
        seq(choice("first", "offset", "after"), ":", $.value)),
      seq(choice("orderasc", "orderdesc"), ":", $.value)),

    function: $ => seq(field("name", $.identifier), "(",
      field("value", $.expr), ")"),

    groupby: $ => seq("@groupby", "(", $.pred_lit, ")"),

    expr: $ => choice(
      commaSep1($.value),
      seq($.pred_lit, "[", commaSep1($.value), "]"),
    ),

    value: $ => choice(
      $.interpreted_string_literal,
      $.dollar_lit,
      hexLiteral,
      decimalLiteral,
      $.pred_lit
    ),

    interpreted_string_literal: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^"\n\\]+/)),
        $.escape_sequence
      )),
      '"'
    ),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/
      )
    )),
    identifier: $ => /\w*[._A-Za-z]\w*/,

    alphanumeric_lit: $ => /\w[a-zA-Z0-9_]\w*/,

    hexadecimal_lit: $ => /0[xX]\w[0-9a-fA-F]\w*/,

    dollar_lit: $ => /\$\w*[A-Za-z]\w*/,

    numeric_lit: $ => /(0|[1-9][0-9]*)/,

    pred_value: $ => choice(
      prec(0, $.pred_lit),
      seq("math", "(", $.math_expr, ")"),
      prec(1, seq($.identifier, "(", $.pred_value, ")")),
    ),

    math_expr: $ => choice(
      $.math_binary_expr,
      $.math_func_unary,
      $.math_func_tri,
      $.value,
      $.math_func_binary,
    ),

    math_binary_expr: $ => prec.left(2, seq($.math_expr, choice("+", "-", "*", "/", "%", "<", ">", "<=", ">=", "==", "!="), $.math_expr)),

    math_func_unary: $ => prec.left(3, seq(choice("floor", "ceil", "ln", "exp", "sqrt", "since", "min", "max"), "(", $.math_expr, ")")),

    math_func_binary: $ => prec.left(2, seq(choice("pow", "logbase"), "(", $.math_expr, ",", $.math_expr, ")")),

    math_func_tri: $ => seq("cond", "(", $.math_expr, ",", $.math_expr, ",", $.math_expr, ")"),

    pred_lit: $ => choice(
      $.identifier,
      seq($.identifier, "@", $.identifier),
      seq("~", $.identifier)
    ),
  }
});

function block(rule) {
  return seq("{", rule, "}")
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}

function commaSep(rule) {
  return optional(commaSep1(rule))
}

function optionalSeq(rule) {

}
