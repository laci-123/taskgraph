use crate::task::{Progress, ComputedProgress, RepeatBase, TaskId};
use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub struct JsError {
    short_name: String,
    details: String,
}

#[wasm_bindgen]
impl JsError {
    #[wasm_bindgen(getter)]
    pub fn short_name(&self) -> String {
        self.short_name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn details(&self) -> String {
        self.details.clone()
    }
}


#[wasm_bindgen]
pub struct JsPossibleTask {
    possible_progresses: Vec<Progress>,
    possible_children: Vec<TaskId>, 
}

#[wasm_bindgen]
impl JsPossibleTask {
    #[wasm_bindgen(getter)]
    pub fn possible_progresses(&self) -> Vec<Progress> {
        self.possible_progresses.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn possible_children(&self) -> Vec<TaskId> {
        self.possible_children.clone()
    }
}


#[wasm_bindgen]
pub struct JsTask {
    #[wasm_bindgen(readonly)]
    pub id: TaskId,
    #[wasm_bindgen(readonly)]
    pub priority: i8,
    #[wasm_bindgen(readonly)]
    pub computed_priority: Option<i8>,
    #[wasm_bindgen(readonly)]
    pub deadline: f64,
    #[wasm_bindgen(readonly)]
    pub computed_deadline: Option<f64>,
    #[wasm_bindgen(readonly)]
    pub birthline: f64,
    #[wasm_bindgen(readonly)]
    pub progress: Progress,
    #[wasm_bindgen(readonly)]
    pub computed_progress: Option<ComputedProgress>,
    #[wasm_bindgen(readonly)]
    pub group_like: bool,
    #[wasm_bindgen(readonly)]
    pub auto_fail: bool,
    #[wasm_bindgen(readonly)]
    pub finished: Option<f64>,
    #[wasm_bindgen(readonly)]
    pub repeat: Option<f64>,
    #[wasm_bindgen(readonly)]
    pub repeat_base: Option<RepeatBase>,
    #[wasm_bindgen(readonly)]
    pub next_instance: Option<TaskId>,
    name: String,
    description: String,
    children: Vec<TaskId>,
    parents: Vec<TaskId>,
}

#[wasm_bindgen]
impl JsTask {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: TaskId, priority: i8,
        computed_priority: Option<i8>,
        deadline: f64,
        computed_deadline: Option<f64>,
        birthline: f64,
        progress: Progress,
        computed_progress: Option<ComputedProgress>,
        group_like: bool,
        auto_fail: bool,
        finished: Option<f64>,
        repeat: Option<f64>,
        repeat_base: Option<RepeatBase>,
        next_instance: Option<TaskId>,
        name: String,
        description: String,
        children: Vec<TaskId>,
        parents: Vec<TaskId>
    ) -> Self {
        Self {
            id, priority, computed_priority, deadline, computed_deadline, birthline,
            progress, computed_progress, group_like, auto_fail, finished, repeat,
            repeat_base, next_instance, name, description, children, parents,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn description(&self) -> String {
        self.description.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn children(&self) -> Vec<TaskId> {
        self.children.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn parents(&self) -> Vec<TaskId> {
        self.parents.clone()
    }
}