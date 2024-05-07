use std::{cell::UnsafeCell, collections::{hash_set, HashMap, HashSet}, error::Error, iter::Cycle, mem::transmute};
use std::fmt::Debug;
use serde::{Serialize, Serializer, Deserialize, Deserializer};
use serde::ser::SerializeMap;
use thiserror::Error;


#[derive(Default, PartialEq, Eq, Debug, Clone, Copy)]
enum Color {
    #[default]
    White,
    Gray,
    Black,
}

#[derive(Default, Serialize, Deserialize)]
struct Node<T> {
    value: T,
    parents: HashSet<usize>,
    children: HashSet<usize>,
    #[serde(skip)]
    color: Color,
}

#[derive(Default)]
pub struct Graph<T> {
    nodes: HashMap<usize, UnsafeCell<Node<T>>>,
}

pub const MAX_CALL_DEPTH: usize = 1000;

// It would be very nice if these could be an enum, 
// but enums as const parameters are still an experimental feature.
type DfsDirection = bool;
const TOWARDS_CHILDREN: DfsDirection = true;
const TOWARDS_PARENTS:  DfsDirection = false;

impl<T: Serialize> Serialize for Graph<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut map = serializer.serialize_map(Some(self.nodes.len()))?;
        for (ix, cell) in self.nodes.iter() {
            // SAFE: This is the only reference to this particular node, 
            //       as it is only alive for this iteration of the foor loop.
            let node = 
            unsafe {
                &*cell.get() as &Node<T>
            };
            map.serialize_entry(ix, node)?;
        }
        map.end()
    }
}

impl<'de, T: Deserialize<'de>> Deserialize<'de> for Graph<T> {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let map: HashMap<usize, Node<T>> = HashMap::deserialize(d)?;
        let nodes = 
        unsafe {
            // SAFE: T ans UnsafeCell<T> are guaranteed to have the same in-memory representation
            transmute(map)
        };
        Ok(Graph{ nodes })
    }
}

impl<T> Graph<T> {
    pub fn add_node(&mut self, value: T) -> usize {
        let index = self.smallest_available_index();
        self.nodes.insert(index, UnsafeCell::new(Node {
            value,
            parents: HashSet::default(),
            children: HashSet::default(),
            color: Color::default()
        }));
        index
    }

    fn smallest_available_index(&self) -> usize {
        let length = self.nodes.len();
        for i in 0 .. length {
            if !self.nodes.contains_key(&i) {
                return i;
            }
        }

        length
    }

    pub fn add_edge(&mut self, from: usize, to: usize) -> Result<(), GraphError> {
        if from == to {
            return Err(GraphError::Cycle{ixs: vec![from], finished: true});
        }
        if !self.nodes.contains_key(&from) {
            return Err(GraphError::NonExistentNode(from));
        }
        if !self.nodes.contains_key(&to) {
            return Err(GraphError::NonExistentNode(to));
        }
        let from_node = self.nodes.get_mut(&from).unwrap();
        if from_node.get_mut().parents.contains(&to) {
            return Err(GraphError::Cycle{ixs: vec![from, to], finished: true});
        }
        from_node.get_mut().children.insert(to);

        let to_node  = self.nodes.get_mut(&to).unwrap();
        to_node.get_mut().parents.insert(from);

        Ok(())
    }

    pub fn remove(&mut self, index: usize) {
        self.nodes.remove(&index);
        for node in self.nodes.values_mut() {
            node.get_mut().children.remove(&index);
            node.get_mut().parents.remove(&index);
        }
    }

    pub fn len(&self) -> usize {
        self.nodes.len()
    }
    
    pub fn get(&self, index: usize) -> Result<&T, GraphError> {
        // SAFE: All public methods that can release references to nodes into safe code
        //       take `&self` and `&mut self` properly, therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| &node.value)
        }
    }

    pub fn get_mut(&mut self, index: usize) -> Result<&mut T, GraphError> {
        // SAFE: All public methods that can release references to nodes into safe code
        //       take `&self` and `&mut self` properly, therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node_mut(index).map(|node| &mut node.value)
        }
    }

    pub fn get_children(&self, index: usize) -> Result<hash_set::Iter<usize>, GraphError> {
        // SAFE: All public methods that can release references to nodes into safe code
        //       take `&self` and `&mut self` properly, therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| node.children.iter())
        }
    }

    pub fn get_parents(&self, index: usize) -> Result<hash_set::Iter<usize>, GraphError> {
        // SAFE: All public methods that can release references to nodes into safe code
        //       take `&self` and `&mut self` properly, therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| node.parents.iter())
        }
    }

    // SAFETY: Caller should ensure that there are no mutable reference to this particular node
    //         (multiple immutable references are OK).
    unsafe fn get_node(&self, index: usize) -> Result<&Node<T>, GraphError> {
        let cell = self.nodes.get(&index).ok_or(GraphError::NonExistentNode(index))?;
        Ok(&*cell.get())
    }

    // SAFETY: Caller should ensure that this is the only mutable reference to this particular node.
    unsafe fn get_node_mut(&self, index: usize) -> Result<&mut Node<T>, GraphError> {
        let cell = self.nodes.get(&index).ok_or(GraphError::NonExistentNode(index))?;
        Ok(&mut *cell.get())
    }

    // SAFETY: Caller should ensure that there are no mutable references to any node.
    unsafe fn reset_color(&self) {
        for node in self.nodes.values() {
            (*node.get()).color = Color::White;
        }
    }

    pub fn depth_first_traverse<R>(&mut self, mut pre_action: impl PreAction<T>, mut post_action: impl PostAction<T, R>) -> Result<(), GraphError> {
        let roots = self.nodes
                        .iter()
                        .filter(|(_index, node)| {
                            // SAFE: This reference is only alive within this closure
                            //       and there are no other references alive from anywhere
                            //       else either (which is guaranteed because this method
                            //       takes `&mut self`).
                            unsafe {
                                (*node.get()).parents.len() == 0
                            }
                        })
                        .map(|(index, _node)| *index);

        let mut there_are_roots = false;
        for root in roots {
            there_are_roots = true;
            // SAFE: There are no references alive to any node from aywhere 
            //       which is guaranteed because this method
            //       takes `&mut self`).
            unsafe {
                self.reset_color();
                self.dfs::<TOWARDS_CHILDREN, R>(root, &mut pre_action, &mut post_action, 0)?;
            }
        }

        if self.nodes.len() == 0 || there_are_roots {
            Ok(())
        }
        else {
            let cycle = self.find_cycle()?.unwrap(); // There must be at least 1 cycle if there are nodes but no roots.
            Err(GraphError::Cycle { ixs: cycle, finished: true })
        }
    }

    pub fn possible_children(&mut self, root_ix: usize) -> Result<HashSet<usize>, GraphError> {
        for node in self.nodes.values_mut() {
            node.get_mut().color = Color::White;
        }

        // SAFE: There are no references alive to any node from aywhere 
        //       which is guaranteed because this method takes `&mut self`.
        unsafe {
            self.dfs_no_action::<TOWARDS_PARENTS>(root_ix)?;
        }

        let mut ancestors =
        self.nodes
            .iter()
            .filter(|(_ix, node)| {
                // SAFE: There are no references alive to any node from aywhere 
                //       which is guaranteed because this method takes `&mut self`.
                //       This reference is only alive in whithin the unsafe block
                //       (`color` is copied out).
                let color =
                unsafe {
                    (*node.get()).color
                };
                color == Color::White
            })
            .map(|(ix, _node)| *ix)
            .collect::<HashSet<usize>>();

        // SAFE: There are no references alive to any node from aywhere 
        //       which is guaranteed because this method takes `&mut self`.
        let root =
        unsafe {
            self.get_node(root_ix)?
        };

        for child_ix in root.children.iter() {
            ancestors.remove(child_ix);
        }

        Ok(ancestors)
    }

    fn find_cycle(&mut self) -> Result<Option<Vec<usize>>, GraphError> {
        for node in self.nodes.values_mut() {
            node.get_mut().color = Color::White;
        }

        for (ix, node) in self.nodes.iter() {
            // SAFE: There are no references alive to any node from aywhere 
            //       which is guaranteed because this method takes `&mut self`).
            //       This reference is only alive in whithin the unsafe block
            //       (`color` is copied out).
            let color =
            unsafe {
                (*node.get()).color
            };
            if color == Color::White {
                // SAFE: There are no references alive to any node from aywhere 
                //       which is guaranteed because this method takes `&mut self`)
                //       and there are also no references from within the 
                //       method (see previous saftey note).
                let result =
                unsafe {
                    self.dfs_no_action::<TOWARDS_CHILDREN>(*ix)
                };
                match result {
                    Err(GraphError::Cycle { ixs, .. }) => return Ok(Some(ixs)),
                    Err(other_err)                     => return Err(other_err),
                    _                                  => {},
                }
            }
        }

        Ok(None)
    }

    // SAFETY: Caller must ensure that there are no references to any nodes.
    unsafe fn dfs_no_action<const D: DfsDirection>(&self, root_ix: usize) -> Result<(), GraphError> {
        let mut pre_action  = |_: &mut T, _: Vec<&mut T>| Ok(());
        let mut post_action = |_: &mut T, _: Vec<()>|     Ok(());
        self.dfs::<D, ()>(root_ix, &mut pre_action, &mut post_action, 0).map(|x| x.unwrap())
    }

    // SAFETY: Caller must ensure that there are no references to any nodes.
    unsafe fn dfs<const D: DfsDirection, R>(&self, root_ix: usize, pre_action: &mut impl PreAction<T>, post_action: &mut impl PostAction<T, R>, call_depth: usize) -> Result<Option<R>, GraphError> {
        if call_depth > MAX_CALL_DEPTH {
            return Err(GraphError::StackOverflow);
        }

        let next_ixs;
        {
            // SAFE: This reference to this node is only alive within this block
            //       where no other references of this node are used.
            let root_mut = unsafe {
                self.get_node_mut(root_ix)?
            };
            if root_mut.color == Color::Gray {
                return Err(GraphError::Cycle{ixs: vec![root_ix], finished: false});
            }
            else if root_mut.color == Color::Black {
                return Ok(None);
            }
            root_mut.color = Color::Gray;

            next_ixs = 
            if D == TOWARDS_CHILDREN {
                root_mut.children.clone()
            }
            else {
                root_mut.parents.clone()
            };
            let mut nexts = Vec::new();
            for next_ix in next_ixs.iter() {
                if *next_ix == root_ix {
                    return Err(GraphError::Cycle{ixs: vec![*next_ix, root_ix], finished: true});
                }
                // SAFE: The previous check ensures that no reference in `children` can be
                // of the same node as `root_mut`. And because `children` is a HashSet
                // all of them must reference diffent nodes.
                unsafe {
                    nexts.push(&mut self.get_node_mut(*next_ix)?.value);
                }
            }
            pre_action.call(&mut root_mut.value, nexts).map_err(|error| GraphError::Other(error))?;
        }

        let mut nexts = Vec::new();
        for next_ix in next_ixs.iter() {
            // There are no references to any node when `dfs` is called.
            let return_value = 
            match self.dfs::<D, R>(*next_ix, pre_action, post_action, call_depth + 1) {
                Err(GraphError::Cycle{ixs: mut cycle, finished: false}) => {
                    if cycle[0] == root_ix {
                        Err(GraphError::Cycle{ixs: cycle, finished: true})
                    }
                    else {
                        cycle.push(root_ix);
                        Err(GraphError::Cycle{ixs: cycle, finished: false})
                    }
                },
                other => other,
            }?;
            if let Some(r) = return_value {
                nexts.push(r);
            }
        }

        {
            // SAFE: This reference to this node is only alive within this block
            //       where no other references of this (or any) node are used.
            let root_mut = unsafe {
                self.get_node_mut(root_ix)?
            };

            root_mut.color = Color::Black;
            post_action.call(&mut root_mut.value, nexts)
                       .map_err(|error| GraphError::Other(error))
                       .map(|r| Some(r))
        }
    }
}


pub trait PreAction<T> {
    fn call(&mut self, value: &mut T, nexts: Vec<&mut T>) -> Result<(), Box<dyn Error>>;
}

impl<T, F: FnMut(&mut T, Vec<&mut T>) -> Result<(), Box<dyn Error>>> PreAction<T> for F {
    fn call(&mut self, value: &mut T, nexts: Vec<&mut T>) -> Result<(), Box<dyn Error>> {
        self(value, nexts)
    }
}


pub trait PostAction<T, R> {
    fn call(&mut self, value: &mut T, nexts: Vec<R>) -> Result<R, Box<dyn Error>>;
}

impl<T, R, F: FnMut(&mut T, Vec<R>) -> Result<R, Box<dyn Error>>> PostAction<T, R> for F {
    fn call(&mut self, value: &mut T, nexts: Vec<R>) -> Result<R, Box<dyn Error>> {
        self(value, nexts)
    }
}


#[derive(Debug, Error)]
pub enum GraphError {
    #[error("Circular dependencies: {ixs:?}")]
    Cycle{
        ixs: Vec<usize>,
        finished: bool
    },
    #[error("Non-existent node (ID: {0})")]
    NonExistentNode(usize),
    #[error("Stack overflow")]
    StackOverflow,
    #[error(transparent)]
    Other(Box<dyn Error>),
}


fn circular_equal(v1: &Vec<usize>, v2: &Vec<usize>) -> bool {
    if v1.len() != v2.len() {
        return false;
    }
    let len = v1.len();
    if len == 0 {
        return true;
    }

    for i in 0 .. len {
        if v1.iter().cycle().skip(i).take(len).eq(v2.iter()) {
            return true;
        }
    }

    return false;
}


#[cfg(test)]
mod tests;