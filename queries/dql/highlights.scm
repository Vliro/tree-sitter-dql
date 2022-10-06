(function
  name: (identifier) @function)
(query
  name: (identifier) @function)

(query
  prename: (identifier) @function)

(inner_query
  name: (identifier) @function)
(query_line
  variable: (identifier) @function)

(directive
  name: (identifier) @function)

(fragment
  name: (identifier) @function)
; Keywords

;; [
;;   "filter"
;;   "math"
;;   "func"
;;   "NOT"
;;   "not"
;;   "AND"
;;   "and"
;;   "OR"
;;   "fragment"
;;   "or"
;; ] @keyword

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

[
  "ln"
  "cond"
  "since"
  "orderdesc"
  "expand"
  "orderasc"
  "first"
  "after"
  "fragment"
  "@filter"
  "@facets"
  "AS"
  "@groupby"
  "as"
  "func"
] @keyword

; Identifiers

(interpreted_string_literal) @string

(comment) @comment


(value) @number

"math" @function
"val" @function
"count" @function
