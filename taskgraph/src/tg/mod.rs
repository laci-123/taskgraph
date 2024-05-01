use std::collections::{HashMap, HashSet};
use crate::{mutcell::MutCell, task::{Task, TaskId}};


#[derive(Default, Clone, Copy, PartialEq, Eq)]
enum Color {
    #[default]
    White,
    Gray,
    Black,
    Red,
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
    nodes: HashMap<TaskId, MutCell<Node>>,
}

impl TaskGraph {
    pub fn add_task(&mut self, id: TaskId, task: Task) {
        self.nodes.insert(id, MutCell::new(Node{ task, ..Default::default() }));
    }

    pub fn add_dependency(&mut self, from: TaskId, to: TaskId) -> Result<(), TgError> {
        if !self.nodes.contains_key(&from) {
            return Err(TgError::NonExistentId(from));
        }
        if !self.nodes.contains_key(&to) {
            return Err(TgError::NonExistentId(to));
        }
        if from == to {
            return Err(TgError::Cycle(vec![self.get_cell(from).unwrap().access(|node| node.task.name.clone())]));
        }

        let from_node = self.nodes.get_mut(&from).unwrap();
        if from_node.access(|it| it.parents.contains(&to)) {
            return Err(TgError::Cycle(vec![self.get_cell(from).unwrap().access(|node| node.task.name.clone()),
                                           self.get_cell(to).unwrap().access(|node| node.task.name.clone())]));
        }
        from_node.modify(|it| it.children.insert(to));

        let to_node   = self.nodes.get_mut(&to).unwrap();
        to_node.modify(|it| it.parents.insert(from));

        Ok(())
    }

    pub fn access_task<R>(&self, id: TaskId, mut f: impl FnMut(&Task) -> R) -> Result<R, TgError> {
        self.nodes
            .get(&id)
            .map(|node| node.access(|node| f(&node.task)))
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn dependencies_of(&self, id: TaskId) -> Result<HashSet<TaskId>, TgError> {
        self.nodes
            .get(&id)
            .map(|node| node.access(|node| node.children.clone()))
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn users_of(&self, id: TaskId) -> Result<HashSet<TaskId>, TgError> {
        self.nodes
            .get(&id)
            .map(|node| node.access(|node| node.parents.clone()))
            .ok_or(TgError::NonExistentId(id))
    }

    pub fn calculate(&mut self) -> Result<(), TgError> {
        let root_ids = self.nodes
                           .iter()
                           .filter(|(_id, node)| node.access(|node| node.parents.len() == 0))
                           .map(|(id, _node)| *id);

        for root_id in root_ids {
            self.reset_color();
            self.dfs(root_id)?;
        }

        Ok(())
    }

    fn dfs(&self, root_id: TaskId) -> Result<(), TgError> {
        let root = self.get_cell(root_id)?;
        let mut stack = vec![root];

        while let Some(node) = stack.last() {
            node.modify(|node| self.dfs_step(&mut stack, node))?;
        }

        Ok(())
    }

    fn dfs_step<'a>(&'a self, stack: &mut Vec<&'a MutCell<Node>>, node: &mut Node) -> Result<(), TgError> {
        if node.color == Color::Gray {
            return self.cycle_error(stack, node);
        }
        else if node.color == Color::Black || node.children.len() == 0 {
            node.color = Color::Black;
            stack.pop();
            if let Some(prev) = stack.last_mut() {
                prev.modify(|prev| prev.color = Color::White);
            }
            return Ok(());
        }

        let mut post = false;
        for child_id in node.children.iter() {
            let child = self.get_cell(*child_id)?;
            if child.access(|child| child.color == Color::Black) {
                post = true;
                break;
            }
            child.modify(|child| self.dfs_pre_step(child))?;
            stack.push(child);
        }

        if post {
            self.dfs_post_step(node)?;
            node.color = Color::Black;
        }
        else {
            node.color = Color::Gray;
        }

        Ok(())
    }

    fn dfs_pre_step(&self, node: &mut Node) -> Result<(), TgError> {
        node.task.computed_priority = Some(node.task.priority.max(node.task.priority));
        node.task.computed_deadline = Some(node.task.deadline.min(node.task.deadline));

        Ok(())
    }

    fn dfs_post_step(&self, node: &mut Node) -> Result<(), TgError> {
        
        Ok(())
    }

    fn cycle_error(&self, stack: &mut Vec<&MutCell<Node>>, node: &mut Node) -> Result<(), TgError> {
        node.color = Color::Red;
        let mut cycle = vec![node.task.name.clone()];
        while let Some(n) = stack.pop() {
            if n.access(|n| n.color != Color::Red) {
                cycle.push(n.access(|n| n.task.name.clone()));
            }
            else {
                return Err(TgError::Cycle(cycle));
            }
        }
        unreachable!("'cycle_error' function was called but there is no cycle")
    }

    fn get_cell(&self, id: TaskId) -> Result<&MutCell<Node>, TgError> {
        self.nodes
            .get(&id)
            .ok_or(TgError::NonExistentId(id))
    }

    fn color_of(&self, id: TaskId) -> Result<Color, TgError> {
        self.nodes
            .get(&id)
            .map(|node| node.access(|node| node.color))
            .ok_or(TgError::NonExistentId(id))
    }

    fn reset_color(&self) {
        for node in self.nodes.values() {
            node.modify(|node| node.color = Color::White);
        }
    }
}

#[derive(Debug)]
pub enum TgError {
    Cycle(Vec<String>),
    NonExistentId(TaskId),
}
