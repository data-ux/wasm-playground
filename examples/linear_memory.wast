(module
  (memory 1 (segment 0 "ABC\a7D") (segment 20 "WASM"))

  ;; Data section
  (func $data (result f64)
    (f64.and
      (f64.and
        (f64.and
          (f64.eq (f64.load8_u (f64.const 0)) (f64.const 65))
          (f64.eq (f64.load8_u (f64.const 3)) (f64.const 167))
        )
        (f64.and
          (f64.eq (f64.load8_u (f64.const 6)) (f64.const 0))
          (f64.eq (f64.load8_u (f64.const 19)) (f64.const 0))
        )
      )
      (f64.and
        (f64.and
          (f64.eq (f64.load8_u (f64.const 20)) (f64.const 87))
          (f64.eq (f64.load8_u (f64.const 23)) (f64.const 77))
        )
        (f64.and
          (f64.eq (f64.load8_u (f64.const 24)) (f64.const 0))
          (f64.eq (f64.load8_u (f64.const 1023)) (f64.const 0))
        )
      )
    )
  )

  ;; Aligned read/write
  (func $aligned (result f64)
    (local f64 f64 f64)
    (set_local 0 (f64.const 10))
    (loop
      (if
        (f64.eq (get_local 0) (f64.const 0))
        (br 1)
      )
      (set_local 2 (f64.mul (get_local 0) (f64.const 4)))
      (f64.store (get_local 2) (get_local 0))
      (set_local 1 (f64.load (get_local 2)))
      (if
        (f64.ne (get_local 0) (get_local 1))
        (return (f64.const 0))
      )
      (set_local 0 (f64.sub (get_local 0) (f64.const 1)))
      (br 0)
    )
    (f64.const 1)
  )

  (export "data" $data)
  (export "aligned" $aligned)
)