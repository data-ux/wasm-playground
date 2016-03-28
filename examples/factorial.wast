(module
  (func $factorial (param $n i32) (result i32)
    (local $i i32)
    (local $res i32)
    (set_local $i (get_local $n))
    (set_local $res (i32.const 1))
    (loop $done $loop
      (if
        (i32.eq (get_local $i) (i32.const 0))
        (br $done)
        (block
          (set_local $res (i32.mul (get_local $i) (get_local $res)))
          (set_local $i (i32.sub (get_local $i) (i32.const 1)))
        )
      )
      (br $loop)
    )
    (get_local $res)
  )
  (export "factorial" $factorial)
)