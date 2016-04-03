(module
  (func $even (param $n i32) (result i32)
    (select 
      (i32.const 1)
      (call $odd (i32.sub (get_local $n) (i32.const 1)))
      (i32.eq (get_local $n) (i32.const 0))
    )
  )

  (func $odd (param $n i32) (result i32)
    (select 
      (i32.const 0)
      (call $even (i32.sub (get_local $n) (i32.const 1)))
      (i32.eq (get_local $n) (i32.const 0))
    )
  )
  
  (export "even" $even)
  (export "odd" $odd)
)