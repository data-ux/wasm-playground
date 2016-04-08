(module
  (func $factorial (param $num f64) (result f64)
    (local $i f64)
    (local $result f64)
    (set_local $i (get_local $num))
    (set_local $result (f64.const 1))
    (loop $done $loop
      (if
        (f64.eq (get_local $i) (f64.const 0))
        (br $done)
        (block
          (set_local $result (f64.mul (get_local $i) (get_local $result)))
          (set_local $i (f64.sub (get_local $i) (f64.const 1)))
        )
      )
      (br $loop)
    )
    (get_local $result)
  )
  (export "factorial" $factorial)
)