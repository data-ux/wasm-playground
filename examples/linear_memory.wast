(module
  (memory 1 (segment 0 "ABC\a7D") (segment 20 "WASM"))

  ;; Data section
  (func $data (result i32)
    (i32.and
      (i32.and
        (i32.and
          (i32.eq (i32.load8_u (i32.const 0)) (i32.const 65))
          (i32.eq (i32.load8_u (i32.const 3)) (i32.const 167))
        )
        (i32.and
          (i32.eq (i32.load8_u (i32.const 6)) (i32.const 0))
          (i32.eq (i32.load8_u (i32.const 19)) (i32.const 0))
        )
      )
      (i32.and
        (i32.and
          (i32.eq (i32.load8_u (i32.const 20)) (i32.const 87))
          (i32.eq (i32.load8_u (i32.const 23)) (i32.const 77))
        )
        (i32.and
          (i32.eq (i32.load8_u (i32.const 24)) (i32.const 0))
          (i32.eq (i32.load8_u (i32.const 1023)) (i32.const 0))
        )
      )
    )
  )

  ;; Aligned read/write
  (func $aligned (result i32)
    (local i32 i32 i32)
    (set_local 0 (i32.const 10))
    (loop
      (if
        (i32.eq (get_local 0) (i32.const 0))
        (br 1)
      )
      (set_local 2 (i32.mul (get_local 0) (i32.const 4)))
      (i32.store (get_local 2) (get_local 0))
      (set_local 1 (i32.load (get_local 2)))
      (if
        (i32.ne (get_local 0) (get_local 1))
        (return (i32.const 0))
      )
      (set_local 0 (i32.sub (get_local 0) (i32.const 1)))
      (br 0)
    )
    (i32.const 1)
  )

  (export "data" $data)
  (export "aligned" $aligned)
)