use super::*;
use pretty_assertions::assert_eq;
use crate::utils::assert_eq_json;
use serde_json::json;


#[test]
fn serialize_all_defaults() {
    let task = Task::default();

    let json = serde_json::to_string(&task).unwrap();
    assert_eq_json(&json, json!({"name": ""}));
}

#[test]
fn serialize_some_defaults() {
    let mut task = Task::default();
    task.name = "do something".to_string();
    task.priority = 3;
    task.progress = Progress::Started;
    task.computed_progress = Some(ComputedProgress::Failed);

    let json = serde_json::to_string(&task).unwrap();
    assert_eq_json(&json, json!({
        "name": "do something",
        "priority": 3,
        "progress": "Started"
    }));
}

#[test]
fn serialize_no_defaults() {
    let mut task = Task::default();
    task.name = "do something".to_string();
    task.description = "Do some stuff.".to_string();
    task.priority = 3;
    task.computed_priority = Some(4);
    task.deadline = TimePoint::Normal(100);
    task.computed_deadline = Some(TimePoint::Normal(99));
    task.birthline = TimePoint::Normal(97);
    task.progress = Progress::Started;
    task.computed_progress = Some(ComputedProgress::Failed);
    task.group_like = true;
    task.auto_fail = true;
    task.finished = Some(98);
    task.recurrence = Some(Recurrence {
        repeat: Duration::seconds(10),
        repeat_base: RepeatBase::Deadline,
        next_instance: 12,
    });

    let json = serde_json::to_string(&task).unwrap();
    assert_eq_json(&json, json!({
        "name": "do something",
        "description": "Do some stuff.",
        "priority": 3,
        "deadline": 100,
        "birthline": 97,
        "progress": "Started",
        "group_like": true,
        "auto_fail": true,
        "finished": 98,
        "recurrence": {
            "repeat": 10,
            "repeat_base": "Deadline",
            "next_instance": 12
        }
    }));
}

#[test]
fn deserialise_all_defaults() {
    let json = json!({"name": "feed cat"}).to_string();
    let task: Task = serde_json::from_str(&json).unwrap();
    assert_eq!(task.name, "feed cat");
    assert_eq!(task.description, "");
    assert_eq!(task.priority, 0);
    assert_eq!(task.computed_priority, None);
    assert_eq!(task.deadline, TimePoint::AfterEverything);
    assert_eq!(task.computed_deadline, None);
    assert_eq!(task.birthline, TimePoint::BeforeEverything);
    assert_eq!(task.progress, Progress::Todo);
    assert_eq!(task.computed_progress, None);
    assert_eq!(task.group_like, false);
    assert_eq!(task.auto_fail, false);
    assert_eq!(task.finished, None);
    assert_eq!(task.recurrence, None);
}

#[test]
fn deserialize_no_defaults() {
    let json = json!({
        "name": "do something",
        "description": "Do some stuff.",
        "priority": 3,
        "deadline": 100,
        "birthline": 97,
        "progress": "Started",
        "group_like": true,
        "auto_fail": true,
        "finished": 98,
        "recurrence": {
            "repeat": 10,
            "repeat_base": "Deadline",
            "next_instance": 12
        }
    }).to_string();
    let task: Task = serde_json::from_str(&json).unwrap();
    assert_eq!(task.name, "do something");
    assert_eq!(task.description, "Do some stuff.");
    assert_eq!(task.priority, 3);
    assert_eq!(task.computed_priority, None);
    assert_eq!(task.deadline, TimePoint::Normal(100));
    assert_eq!(task.computed_deadline, None);
    assert_eq!(task.birthline, TimePoint::Normal(97));
    assert_eq!(task.progress, Progress::Started);
    assert_eq!(task.computed_progress, None);
    assert_eq!(task.group_like, true);
    assert_eq!(task.auto_fail, true);
    assert_eq!(task.finished, Some(98));
    assert_eq!(task.recurrence, Some(Recurrence {
        repeat: Duration::seconds(10),
        repeat_base: RepeatBase::Deadline,
        next_instance: 12,
    }));
}

#[test]
fn deserialize_error() {
    // "name" field is missing
    let json = "";
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // "name" field is missing
    let json = json!({}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // "name" field has wrong type
    let json = json!({"name": 123}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // "name" field is missing
    let json = json!({"description": "Buy food", "progress": "Done"}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // computed fields should not appear in serialized form
    let json = json!({"name": "feed dog", "computed_deadline": "AfterEverything"}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // "recurrence" has wrong type
    let json = json!({"name": "eat", "recurrence": 123}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());

    // "recurrence" has missing fields
    let json = json!({"name": "eat", "recurrence": {"repeat": 123, "repeat_base": "Finished"}}).to_string();
    let maybe_task: Result<Task, serde_json::Error> = serde_json::from_str(&json);
    assert!(maybe_task.is_err());
}
