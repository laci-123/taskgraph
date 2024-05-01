use std::collections::{HashMap, HashSet};
use crate::task::{Task, TaskId};


#[derive(Default, Clone, Copy, PartialEq, Eq)]
enum Color {
    #[default]
    White,
    Gray,
    Black,
}


#[derive(Default)]
struct Node {
    task: Task,
    color: Color,
    children: HashSet<TaskId>,
    parents: HashSet<TaskId>,
}


#[derive(Default)]
pub struct TaskGraph {
    nodes: HashMap<TaskId, Node>,
}

impl TaskGraph {
    pub fn add_task(&mut self, id: TaskId, task: Task) {
        self.nodes.insert(id, Node{ task, ..Default::default() });
    }

    pub fn add_dependency(&mut self, from: TaskId, to: TaskId) -> Result<(), TgError> {
        if !self.nodes.contains_key(&from) {
            return Err(TgError::NonExistentId(from));
        }
        if !self.nodes.contains_key(&to) {
            return Err(TgError::NonExistentId(to));
        }
        if from == to {
            return Err(TgError::Cycle(vec![from]));
        }

        let from_node = self.nodes.get_mut(&from).unwrap();
        if from_node.parents.contains(&to) {
            return Err(TgError::Cycle(vec![from, to]));
        }
        from_node.children.insert(to);

        let to_node   = self.nodes.get_mut(&to).unwrap();
        to_node.parents.insert(from);

        Ok(())
    }

    pub fn get(&self, id: TaskId) -> Result<&Task, TgError> {
        self.nodes
            .get(&id)
            .map(|node| &node.task)
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn dependencies_of(&self, id: TaskId) -> Result<&HashSet<TaskId>, TgError> {
        self.nodes
            .get(&id)
            .map(|node| &node.children)
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn users_of(&self, id: TaskId) -> Result<&HashSet<TaskId>, TgError> {
        self.nodes
            .get(&id)
            .map(|node| &node.parents)
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn calculate(&mut self) -> Result<(), TgError> {
        let roots = self.nodes
                        .iter()
                        .filter(|(_id, node)| node.parents.len() == 0)
                        .map(|(id, _node)| *id)
                        .collect::<Vec<TaskId>>();

        for root in roots {
            self.dfs(root)?;
        }

        Ok(())
    }

    fn dfs(&mut self, root: TaskId) -> Result<(), TgError> {

        Ok(())
    }

    fn color_of(&self, id: TaskId) -> Result<Color, TgError> {
        self.nodes
            .get(&id)
            .map(|node| node.color)
            .ok_or(TgError::NonExistentId(id))
    }

    fn reset_color(&mut self) {
        for node in self.nodes.values_mut() {
            node.color = Color::White;
        }
    }
}


pub enum TgError {
    Cycle(Vec<TaskId>),
    NonExistentId(TaskId),
}
