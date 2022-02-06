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

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => $.query_root,

    word: $ => $.identifier,

    identifier: $ => /[a-z_]+/,

    query_root: $ => seq("query", optional($.string_lit), optional($.query_args), $.query_block),

    directive: $ => seq("@", $.string_lit, optional(seq("(", commaSep(seq($.string_lit, ":", $.expr)), ")"))),

    query_block: $ => seq('{', repeat($.query), '}'),

    query_args: $ => seq('(', commaSep($.query_args_value), ')'),

    query_args_value: $ => seq($.dollar_lit, ':', $.string_lit, optional(seq("=", seq("\"", $.string_lit, "\"")))),

    query: $ => seq($.alphanumeric_lit, "(", "func:", $.function, optional(seq(",", $.pagination)), ")", repeat($.directive), block(repeat($.pred))),

    pred: $ => seq(optional(seq($.string_lit, ":")), $.pred_value,
      optional($.filter), optional(seq("(", $.pagination, ")")), optional(block(repeat($.pred)))),

    filter: $ => seq("@filter", "(", $.function, ")"),

    function: $ => $.function_val,

    facet: $ => seq("@facets", optional("(",), commaSep(choice(
      $.function,
      $.pred_lit,
      seq($.pred_lit, ":", $.pred_lit),
    ))),

    pagination: $ => commaSep1(
      choice(
        seq(choice("first", "offset", "after"), ":", $.expr)),
      seq(choice("orderasc", "orderdesc"), ":", $.expr)),

    function_val: $ => seq(alias($.identifier, "name"), "(",
      choice(
        $.expr,
        seq($.pred_lit, ",", $.expr),
      ), ")"),

    string_lit: $ => /\w*[._A-Za-z]\w*/,

    alphanumeric_lit: $ => /\w[a-zA-Z0-9_]\w*/,

    expr: $ => choice(
      seq("\"", optional($.string_lit), "\""),
      $.dollar_lit,
      hexLiteral,
      decimalLiteral,
    ),
    hexadecimal_lit: $ => /0[xX]\w[0-9a-fA-F]\w*/,

    dollar_lit: $ => /\$\w*[A-Za-z]\w*/,

    numeric_lit: $ => /(0|[1-9][0-9]*)/,

    pred_value: $ => choice(
      $.pred_lit,
      seq($.string_lit, choice("as", "AS"), $.pred_lit),
      seq("expand", "(", $.string_lit, ")"),
    ),

    pred_lit: $ => choice(
      $.string_lit,
      seq($.string_lit, "@", $.string_lit),
      seq("~", $.string_lit)
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
