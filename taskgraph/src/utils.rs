pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
pub fn assert_eq_json(json_str: &str, correct_json: serde_json::Value) {
    let json: serde_json::Value = serde_json::from_str(json_str).unwrap();
    assert_eq!(json, correct_json);
}
