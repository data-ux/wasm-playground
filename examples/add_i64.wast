(module
  (func $add (param $x i64) (param $y i64) (result i64) (i64.add (get_local $x) (get_local $y)))
  (export "add" $add)
)