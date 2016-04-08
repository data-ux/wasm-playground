(module
  (func $add (param $x f64) (param $y f64) (result f64) (f64.add (get_local $x) (get_local $y)))
  (export "add" $add)
)