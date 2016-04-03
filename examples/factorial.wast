(module
  (func $factorial (param $num i32) (result i32)
    (local $i i32)
    (local $result i32)
    (set_local $i (get_local $num))
    (set_local $result (i32.const 1))
    (loop $done $loop
      (if
        (i32.eq (get_local $i) (i32.const 0))
        (br $done)
        (block
          (set_local $result (i32.mul (get_local $i) (get_local $result)))
          (set_local $i (i32.sub (get_local $i) (i32.const 1)))
        )
      )
      (br $loop)
    )
    (get_local $result)
  )
  (export "factorial" $factorial)
)