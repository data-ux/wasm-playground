(module
  (func $even (param $n f64) (result f64)
    (select 
      (f64.const 1)
      (call $odd (f64.sub (get_local $n) (f64.const 1)))
      (f64.eq (get_local $n) (f64.const 0))
    )
  )

  (func $odd (param $n f64) (result f64)
    (select 
      (f64.const 0)
      (call $even (f64.sub (get_local $n) (f64.const 1)))
      (f64.eq (get_local $n) (f64.const 0))
    )
  )
  
  (export "even" $even)
  (export "odd" $odd)
)