use std::collections::HashSet;

use tryvial::try_block;

use crate::graph;
use crate::js_bindings::JsError;
use crate::{graph::{Graph, GraphError}, js_bindings::JsTask, task::{Task, TaskId}};


pub struct TaskGraph {
    graph: Graph<Task>,
}

impl TaskGraph {
    fn calculate(&mut self) -> Result<(), GraphError> {
        todo!()
    }

    pub fn get_task(&self, id: TaskId) -> Option<JsTask> {
        let task     = self.graph.get(id).ok()?;
        let children = self.graph.get_children(id).ok()?.copied();
        let parents  = self.graph.get_parents(id).ok()?.copied();
        Some(JsTask::from_task(task, id, children, parents))
    }

    pub fn set_task(&mut self, js_task: JsTask) -> Result<(), JsError> {
        let result: Result<(), GraphError> =
        try_block! {
            let (task, children) = js_task.to_task();
            let id = self.graph.add_node(task);
            for child in children {
                self.graph.add_edge(id, child)?;
            }
            self.calculate()?;
        };
        result.map_err(|err| self.grapherror_to_jserror(err, "Error while saving task"))
    }

    pub fn delete_task(&mut self, id: TaskId) -> Result<(), JsError> {
        self.graph.remove(id);
        self.calculate().map_err(|err| self.grapherror_to_jserror(err, "Error while deleting task"))?;
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
