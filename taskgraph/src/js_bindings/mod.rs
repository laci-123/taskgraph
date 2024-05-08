use crate::task::{ComputedProgress, Progress, Recurrence, RepeatBase, Task, TaskId};
use chrono::Duration;
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

impl JsError {
    pub fn new(short_name: &str, details: &str) -> Self {
        Self {
            short_name: short_name.into(),
            details: details.into(),
        }
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
    pub computed_priority: i8,
    #[wasm_bindgen(readonly)]
    pub deadline: f64,
    #[wasm_bindgen(readonly)]
    pub computed_deadline: f64,
    #[wasm_bindgen(readonly)]
    pub birthline: f64,
    #[wasm_bindgen(readonly)]
    pub progress: Progress,
    #[wasm_bindgen(readonly)]
    pub computed_progress: ComputedProgress,
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
    dependencies: Vec<TaskId>,
    others_depending_on_this: Vec<TaskId>,
}

#[wasm_bindgen]
impl JsTask {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: TaskId,
        priority: i8,
        deadline: f64,
        birthline: f64,
        progress: Progress,
        group_like: bool,
        auto_fail: bool,
        finished: Option<f64>,
        repeat: Option<f64>,
        repeat_base: Option<RepeatBase>,
        next_instance: Option<TaskId>,
        name: String,
        description: String,
        dependencies: Vec<TaskId>,
    ) -> Self {
        Self {
            id, priority, computed_priority: 0, deadline, computed_deadline: f64::INFINITY, 
            birthline, progress, computed_progress: ComputedProgress::default(), 
            group_like, auto_fail, finished, repeat, repeat_base, next_instance, 
            name, description, dependencies, others_depending_on_this: vec![],
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
    pub fn dependencies(&self) -> Vec<TaskId> {
        self.dependencies.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn others_depending_on_this(&self) -> Vec<TaskId> {
        self.others_depending_on_this.clone()
    }
}

impl JsTask {
    pub fn from_task(task: &Task, id: TaskId, children: impl Iterator<Item = usize>, parents: impl Iterator<Item = usize>) -> Self {
        Self { 
            id, 
            priority: task.priority, 
            computed_priority: task.computed_priority, 
            deadline: task.deadline.into(), 
            computed_deadline: task.computed_deadline.into(), 
            birthline: task.birthline.into(), 
            progress: task.progress, 
            computed_progress: task.computed_progress, 
            group_like: task.group_like, 
            auto_fail: task.auto_fail, 
            finished: task.finished.map(|x| x as f64), 
            repeat: task.recurrence.as_ref().map(|r| r.repeat.num_seconds() as f64), 
            repeat_base: task.recurrence.as_ref().map(|r| r.repeat_base), 
            next_instance: task.recurrence.as_ref().map(|r| r.next_instance), 
            name: task.name.clone(), 
            description: task.description.clone(), 
            dependencies: children.collect(), 
            others_depending_on_this: parents.collect(), 
        }
    }

    pub fn to_task(self) -> (Task, Vec<TaskId>) {
        let recurrence = 
        if let (Some(repeat), Some(repeat_base), Some(next_instance)) = (self.repeat, self.repeat_base, self.next_instance) {
            Some(Recurrence {
                repeat: Duration::seconds(repeat as i64),
                repeat_base: repeat_base,
                next_instance: next_instance,
            })
        }
        else {
            None
        };

        let task = Task {
            name: self.name,
            description: self.description,
            priority: self.priority,
            deadline: self.deadline.into(),
            birthline: self.birthline.into(),
            progress: self.progress,
            group_like: self.group_like,
            auto_fail: self.auto_fail,
            finished: self.finished.map(|f| f as i64),
            recurrence,
            ..Default::default()
        };
        
        (task, self.dependencies)
    }
}