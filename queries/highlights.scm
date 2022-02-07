(function
  name: (identifier) @function)

(directive
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

(escaped_string_lit) @string

(comment) @comment
