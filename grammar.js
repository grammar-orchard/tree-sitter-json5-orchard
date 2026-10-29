/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * @param {RuleOrLiteral} elem
 * @returns {ChoiceRule}
 */
function commaSep(elem) {
  return optional(seq(elem, repeat(seq(",", elem)), optional(",")));
}

/**
 * @param {...RuleOrLiteral} args
 * @returns {RepeatRule}
 */
function repChoice(...args) {
  return repeat(choice(...args));
}

export default grammar({
  name: "json5_orchard",

  extras: ($) => [$.comment, /\s/],
  inline: ($) => [$.name],

  rules: {
    file: ($) => $._value,

    comment: (_) =>
      token(choice(
        seq("//", /[^\n]*/),
        seq("/*", /([^*]|\*+[^/*])*\*+/, "/"),
      )),

    object: ($) => seq("{", commaSep($.member), "}"),
    member: ($) => seq(field("name", $.name), ":", field("value", $._value)),
    name: ($) => choice($.string, $.identifier),
    identifier: (_) => {
      const identifier_start = /[\$_\p{L}]/u;
      const identifier_part = choice(identifier_start, /[0-9]/);
      return token(seq(identifier_start, repeat(identifier_part)));
    },

    array: ($) => seq("[", commaSep($._value), "]"),

    string: (_) => {
      const escape_sequence = seq(
        "\\",
        choice(
          /["'\\/bfnrtv]/,
          /u[0-9a-fA-F]{4}/,
          /x[0-9a-fA-F]{2}/,
          /\r?\n/, // Line continuation
        ),
      );
      const double_quote = seq(
        '"',
        repChoice(
          escape_sequence,
          /[^"\\]+/,
        ),
        '"',
      );
      const single_quote = seq(
        "'",
        repChoice(
          escape_sequence,
          /[^'\\]+/,
        ),
        "'",
      );
      return token(choice(double_quote, single_quote));
    },

    number: (_) => {
      const hex_digit = /[0-9a-fA-F]+/;
      const hex_int = seq("0", /[xX]/, hex_digit);

      const dec_digit = /[0-9]/;
      const exp_part = seq(/[eE]/, optional(/[+-]/), repeat1(dec_digit));
      const int_literal = choice("0", seq(/[1-9]/, repeat(dec_digit)));
      const dec_literal = choice(
        seq(int_literal, ".", repeat(dec_digit), optional(exp_part)),
        seq(".", repeat(dec_digit), optional(exp_part)),
        seq(int_literal, optional(exp_part)),
      );

      return token(
        seq(/[+-]?/, choice(hex_int, dec_literal, "Infinity", "NaN")),
      );
    },

    null: (_) => "null",
    true: (_) => "true",
    false: (_) => "false",

    _value: ($) =>
      choice($.object, $.array, $.number, $.string, $.null, $.true, $.false),
  },
});
