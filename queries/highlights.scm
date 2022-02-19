(function
  name: (identifier) @function)

(query
  name: (identifier) @function)
(directive
  name: (identifier) @function)

(fragment
  name: (identifier) @function)
; Keywords

[
  "@filter"
  "math"
  "func"
  "NOT"
  "not"
  "AND"
  "and"
  "OR"
  "fragment"
  "or"
] @keyword

; Operators

[
  ">"
  "<"
  ">="
  "<="
  "!="
  "=="
  "/"
  "*"
  "+"
  "-"
  "%"
] @operator

; Identifiers

(interpreted_string_literal) @string

(comment) @comment

(pred_lit) @type
