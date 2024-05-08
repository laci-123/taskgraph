use tryvial::try_block;
use crate::graph;
use crate::js_bindings::{JsError, JsTask};
use crate::task::{Progress, RepeatBase};
use crate::timepoint::TimePoint;
use crate::{graph::{Graph, GraphError}, task::{Task, TaskId, ComputedProgress}};
use thiserror::Error;


#[derive(Debug, Error)]
enum TaskGraphError {
    #[error("The birthline of the task '{name:?}' is later than its deadline.\nThis means it cannot be started until when it is already overdue.")]
    BirthlineAfterDeadline {
        name: String,
    }
}


pub struct TaskGraph {
    graph: Graph<Task>,
}

impl TaskGraph {
    fn compute(&mut self, now: TimePoint) -> Result<(), GraphError> {
        let pre_action = |task: &mut Task, dependencies: Vec<&mut Task>| {
            for dep in dependencies {
                dep.computed_deadline = dep.computed_deadline.min(task.computed_deadline); 
                dep.computed_priority = dep.computed_priority.max(task.computed_priority); 
                if dep.birthline > dep.computed_deadline {
                    return Err(Box::new(TaskGraphError::BirthlineAfterDeadline { name: dep.name.to_string() }) as Box<dyn std::error::Error>);
                }
            }
            Ok(())
        };

        let post_action = |task: &mut Task, dependencies: Vec<ComputedProgress>| {
            if dependencies.len() == 0 {
                return Ok(task.computed_progress);
            }

            let old_computed_progress = task.computed_progress;

            task.computed_progress =
            match task.progress {
                Progress::Todo | Progress::Started | Progress::Done => {
                    if dependencies.iter().any(|cp| *cp == ComputedProgress::Failed) {
                        ComputedProgress::Failed
                    }
                    else if dependencies.iter().any(|cp| *cp == ComputedProgress::NotYet) {
                        ComputedProgress::NotYet
                    }
                    else if dependencies.iter().all(|cp| *cp == ComputedProgress::Done) {
                        if now < task.birthline {
                            ComputedProgress::NotYet
                        }
                        else if task.auto_fail && task.progress != Progress::Done && now > task.computed_deadline {
                            ComputedProgress::Failed
                        }
                        else if task.group_like {
                            ComputedProgress::Done
                        }
                        else {
                            task.progress.into()
                        }
                    } 
                    else {
                        ComputedProgress::Blocked
                    }
                },
                Progress::Failed => {
                    ComputedProgress::Failed
                },
            };

            if old_computed_progress != ComputedProgress::Done && task.computed_progress == ComputedProgress::Done {
                task.finished = Some(now.into());
            }

            Ok(task.computed_progress)
        };

        self.graph.depth_first_traverse(pre_action, post_action)?;

        for ix in self.graph.indexes().collect::<Vec<_>>() {
            let task = self.graph.get(ix)?;
            if let Some(rec) = &task.recurrence {
                if task.computed_progress == ComputedProgress::Done {
                    let next_deadline =
                    match rec.repeat_base {
                        RepeatBase::Deadline => task.deadline + rec.repeat,
                        RepeatBase::Finished => TimePoint::Normal(task.finished.unwrap()) + rec.repeat, // TODO: this is very ugly
                    };
                    if let Ok(next_instance) = self.graph.get_mut(rec.next_instance) {
                        next_instance.deadline = next_deadline;
                    }
                    else {
                        let mut next_instance = self.graph.get(ix)?.clone(); // Does not clone dependencies: `next_instance` will have no dependencies.
                        next_instance.deadline = next_deadline;
                        self.graph.add_node(next_instance);
                    }
                }
                else {
                    self.graph.remove(rec.next_instance); 
                }
            }
        }

        Ok(())
    }

    pub fn get_task(&self, id: TaskId) -> Option<JsTask> {
        let task     = self.graph.get(id).ok()?;
        let children = self.graph.get_children(id).ok()?.copied();
        let parents  = self.graph.get_parents(id).ok()?.copied();
        Some(JsTask::from_task(task, id, children, parents))
    }

    pub fn set_task(&mut self, js_task: JsTask, now: f64) -> Result<(), JsError> {
        let result: Result<(), GraphError> =
        try_block! {
            self.graph.remove(js_task.id);
            let (mut task, children) = js_task.to_task();
            task.computed_deadline = task.deadline;
            task.computed_priority = task.priority;
            task.computed_progress = task.progress.into();
            let id = self.graph.add_node(task);
            for child in children {
                self.graph.add_edge(id, child)?;
            }
            self.compute(now.into())?;
        };
        result.map_err(|err| self.grapherror_to_jserror(err, "Error while saving task"))
    }

    pub fn delete_task(&mut self, id: TaskId, now: f64) -> Result<(), JsError> {
        self.graph.remove(id);
        self.compute(now.into()).map_err(|err| self.grapherror_to_jserror(err, "Error while deleting task"))?;
        Ok(())
    }

    pub fn all_tasks(&self) -> Result<Vec<JsTask>, JsError> {
        let result: Result<Vec<JsTask>, GraphError> =
        try_block! {
            let mut js_tasks = Vec::new();
            for ix in self.graph.indexes() {
                let task     = self.graph.get(ix)?;
                let children = self.graph.get_children(ix)?.copied();
                let parents  = self.graph.get_parents(ix)?.copied();
                js_tasks.push(JsTask::from_task(task, ix, children, parents));
            }
            js_tasks
        };
        result.map_err(|err| self.grapherror_to_jserror(err, "Error while collecting all tasks"))
    }

    fn grapherror_to_jserror(&self, err: GraphError, short_name: &str) -> JsError {
        match self.grapherror_to_jserror_internal(&err, short_name) {
            Ok(jserror)     => jserror,
            Err(grapherror) => self.double_grapherror_to_jserror(grapherror, err),
        }
    }

    fn grapherror_to_jserror_internal(&self, err: &GraphError, short_name: &str) -> Result<JsError, GraphError> {
        match err {
            GraphError::Cycle { ixs, .. } => {
                let details =
                match ixs.len() {
                    0 => unreachable!("circular dependencies error with 0 nodes"), 
                    1 => {
                        let name = &self.graph.get(ixs[0])?.name;
                        format!("Circular dependencies detected!\n\nThe node '{name}' (ID: {id}) dependes on itself.", id = ixs[0])
                    },
                    2 => {
                        let name0 = &self.graph.get(ixs[0])?.name;
                        let name1 = &self.graph.get(ixs[1])?.name;
                        format!("Circular dependencies detected!\n\nThe nodes '{name0}' (ID: {id0}) and '{name1}' (ID: {id1}) mutually depend on each other.", id0 = ixs[0], id1 = ixs[1])
                    },
                    _ => {
                        let first_id   = ixs[0];
                        let first_name = &self.graph.get(first_id)?.name;
                        let mut details = format!("Circular dependencies detected!\n\nThe node '{first_name}' (ID: {first_id}) is needed by\n");
                        ixs.iter()
                           .skip(1)
                           .try_fold((), |_, ix| {
                                let name = &self.graph.get(*ix)?.name;
                                details.push_str(&format!("'{name}' (ID: {ix}) which is needed by:\n"));
                                Ok(())
                           })?;
                        details.push_str(&format!("'{first_name}' (ID: {first_id}), completing the circle."));
                        details
                    },
                };
                Ok(JsError::new(short_name, &details))
            },
            GraphError::NonExistentNode(id) => Ok(JsError::new(short_name, &format!("Reference to non-existent task!\n\nFound a reference to the task with ID {id} but there is no such task."))),
            GraphError::StackOverflow => Ok(JsError::new(short_name, 
                                                         &format!("Too many dependencies!\n\nTaskgrpah currently cannot handle dependecy-chains longer than {max} tasks.", max = graph::MAX_CALL_DEPTH))),
            GraphError::Other(other_err) => Ok(JsError::new(short_name, &other_err.to_string())),
        }
    }

    fn double_grapherror_to_jserror(&self, err: GraphError, original: GraphError) -> JsError {
        JsError::new("Internal error", 
                     &format!("An error happend while handeling an other error.\n\n Details:\n {err}\n\nThe original error was:\n{original}\n\nIf you are seeing this message then something seriously broken."))
    }
}
