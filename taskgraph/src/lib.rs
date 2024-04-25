mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, taskgraph!");
}

#[wasm_bindgen]
pub fn some_string(x: i32, y: i32) -> String {
    format!("If I have{x} apples and you give me {y} apples then I'll have {z} apples.", z = x + y)
}
