use chrono::Duration;
use crate::timepoint::{SecondsSinceEpoch, TimePoint};
use serde::{Serialize, Deserialize, Serializer, Deserializer};
use smart_default::SmartDefault;


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
pub enum Progress {
    #[default]
    Todo,
    Started,
    Done,
    Failed,
}

#[derive(Serialize, Deserialize)]
#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub enum ComputedProgress {
    Blocked,
    NotYet,
    Todo,
    Started,
    Done,
    Failed,
}

#[derive(Serialize, Deserialize)]
#[derive(PartialEq, Eq, Clone, Copy, Debug)]
enum RepeatBase {
    Finished,
    Deadline,
}

pub type TaskId = u32;

#[derive(Serialize, Deserialize)]
#[derive(PartialEq, Eq, Debug)]
struct Recurrence {
    #[serde(serialize_with = "serialize_duration", deserialize_with = "deserialize_duration")]
    repeat: Duration,
    repeat_base: RepeatBase,
    next_instance: TaskId,
}

fn serialize_duration<S: Serializer>(d: &Duration, s: S) -> Result<S::Ok, S::Error> {
    s.serialize_i64(d.num_seconds())
}

fn deserialize_duration<'de, D: Deserializer<'de>>(d: D) -> Result<Duration, D::Error> {
    i64::deserialize(d).and_then(|secs| Ok(Duration::seconds(secs)))
}

#[derive(Serialize, Deserialize)]
#[derive(SmartDefault)]
pub struct Task {
    name: String,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    description: String,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    priority: i8,

    #[serde(default, skip_serializing)]
    computed_priority: Option<i8>,

    #[serde(default = "TimePoint::after_everything", skip_serializing_if = "TimePoint::is_after_everything")]
    #[default(TimePoint::AfterEverything)]
    deadline: TimePoint,

    #[serde(default, skip_serializing)]
    computed_deadline: Option<TimePoint>,

    #[serde(default = "TimePoint::before_everything", skip_serializing_if = "TimePoint::is_before_everything")]
    #[default(TimePoint::BeforeEverything)]
    birthline: TimePoint,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    progress: Progress,

    #[serde(default, skip_serializing)]
    computed_progress: Option<ComputedProgress>,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    group_like: bool,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    auto_fail: bool,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    finished: Option<SecondsSinceEpoch>,

    #[serde(default, skip_serializing_if = "IsDefault::is_default")]
    recurrence: Option<Recurrence>,
}


#[cfg(test)]
mod tests;
