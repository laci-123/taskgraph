use chrono::Duration;
use crate::timepoint::{SecondsSinceEpoch, TimePoint};
use serde::{Serialize, Deserialize, Serializer, Deserializer};
use smart_default::SmartDefault;
use wasm_bindgen::prelude::*;


trait IsDefault {
    fn is_default(&self) -> bool;
}

impl<T: Default + PartialEq> IsDefault for T {
    fn is_default(&self) -> bool {
        *self == Self::default()
    }
}


#[derive(Serialize, Deserialize)]
#[derive(Default, PartialEq, Eq, Clone, Copy, Debug)]
#[wasm_bindgen]
pub enum Progress {
    #[default]
    Todo,
    Started,
    Done,
    Failed,
}

#[derive(Serialize, Deserialize)]
#[derive(Default, PartialEq, Eq, Clone, Copy, Debug)]
#[wasm_bindgen]
pub enum ComputedProgress {
    #[default]
    Blocked,
    NotYet,
    Todo,
    Started,
    Done,
    Failed,
}

impl From<Progress> for ComputedProgress {
    fn from(value: Progress) -> Self {
        match value {
            Progress::Todo    => Self::Todo,
            Progress::Started => Self::Started,
            Progress::Done    => Self::Done,
            Progress::Failed  => Self::Failed,
        }
    }
}

#[derive(Serialize, Deserialize)]
#[derive(PartialEq, Eq, Clone, Copy, Debug)]
#[wasm_bindgen]
pub enum RepeatBase {
    Finished,
    Deadline,
}

pub type TaskId = usize;

#[derive(Serialize, Deserialize)]
#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Recurrence {
    #[serde(serialize_with = "serialize_duration", deserialize_with = "deserialize_duration")]
    pub repeat: Duration,
    pub repeat_base: RepeatBase,
    pub next_instance: TaskId,
}

fn serialize_duration<S: Serializer>(d: &Duration, s: S) -> Result<S::Ok, S::Error> {
    s.serialize_i64(d.num_seconds())
}

fn deserialize_duration<'de, D: Deserializer<'de>>(d: D) -> Result<Duration, D::Error> {
    i64::deserialize(d).and_then(|secs| Ok(Duration::seconds(secs)))
}

#[derive(Serialize, Deserialize)]
#[derive(SmartDefault)]
#[derive(Clone)]
pub struct Task {
    pub name: String,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub description: String,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub priority: i8,

    #[serde(default, skip_serializing)]
    pub computed_priority: i8,

    #[serde(default = "TimePoint::after_everything", skip_serializing_if = "TimePoint::is_after_everything")]
    #[default(TimePoint::AfterEverything)]
    pub deadline: TimePoint,

    #[serde(default = "TimePoint::after_everything", skip_serializing)]
    #[default(TimePoint::AfterEverything)]
    pub computed_deadline: TimePoint,

    #[serde(default = "TimePoint::before_everything", skip_serializing_if = "TimePoint::is_before_everything")]
    #[default(TimePoint::BeforeEverything)]
    pub birthline: TimePoint,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub progress: Progress,

    #[serde(default, skip_serializing)]
    pub computed_progress: ComputedProgress,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub group_like: bool,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub auto_fail: bool,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub finished: Option<SecondsSinceEpoch>,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    pub recurrence: Option<Recurrence>,
}

impl Task {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            ..Default::default()
        }
    }
}


#[cfg(test)]
mod tests;
