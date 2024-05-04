#![allow(dead_code)]

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn init() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, taskgraph!");
}

#[wasm_bindgen]
pub fn some_string(x: i32, y: i32) -> String {
    if x < 0 || y < 0 {
        panic!("You can't have negative apples!");
    }
    format!("If I have{x} apples and you give me {y} apples then I'll have {z} apples.", z = x + y)
}


mod timepoint;
mod task;
mod mutcell;
mod graph;
mod tg;
mod utils;
