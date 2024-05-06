use std::{cell::UnsafeCell, collections::{hash_set, HashMap, HashSet}, error::Error, mem::transmute};
use std::fmt::Debug;
use serde::{Serialize, Serializer, Deserialize, Deserializer};
use serde::ser::SerializeMap;


#[derive(Default, PartialEq, Eq, Debug)]
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

const MAX_CALL_DEPTH: usize = 1000;

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
            for node in self.nodes.values() {
                // SAFE: This reference is only alive within this iteration of
                //       the inner for loop and there are no other references
                //       alive from anywhere else either (which is guaranteed
                //       because this method takes `&mut self`).
                unsafe {
                    (*node.get()).color = Color::White;
                }
            }
            // There are no references to any node when `dfs` is called.
            self.dfs(root, &mut pre_action, &mut post_action, 0)?;
        }

        if self.nodes.len() == 0 || there_are_roots {
            Ok(())
        }
        else {
            Err(GraphError::NoRoot)
        }
    }

    fn dfs<R>(&self, root_ix: usize, pre_action: &mut impl PreAction<T>, post_action: &mut impl PostAction<T, R>, call_depth: usize) -> Result<Option<R>, GraphError> {
        // `dfs` is only ever called from `depth_first_traverse` or from itself recursively
        // which both guarantee that when `dfs` is called there are no references alive to any node.
        
        if call_depth > MAX_CALL_DEPTH {
            return Err(GraphError::StackOverflow);
        }

        let child_ixs;
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

            child_ixs = root_mut.children.clone();
            let mut children = Vec::new();
            for child_ix in child_ixs.iter() {
                if *child_ix == root_ix {
                    return Err(GraphError::Cycle{ixs: vec![*child_ix, root_ix], finished: true});
                }
                // SAFE: The previous check ensures that no reference in `children` can be
                // of the same node as `root_mut`. And because `children` is a HashSet
                // all of them must reference diffent nodes.
                unsafe {
                    children.push(&mut self.get_node_mut(*child_ix)?.value);
                }
            }
            pre_action.call(&mut root_mut.value, children).map_err(|error| GraphError::Other(error))?;
        }

        let mut children = Vec::new();
        for child_ix in child_ixs.iter() {
            // There are no references to any node when `dfs` is called.
            let return_value = 
            match self.dfs(*child_ix, pre_action, post_action, call_depth + 1) {
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
                children.push(r);
            }
        }

        {
            // SAFE: This reference to this node is only alive within this block
            //       where no other references of this (or any) node are used.
            let root_mut = unsafe {
                self.get_node_mut(root_ix)?
            };

            root_mut.color = Color::Black;
            post_action.call(&mut root_mut.value, children)
                       .map_err(|error| GraphError::Other(error))
                       .map(|r| Some(r))
        }
    }
}


pub trait PreAction<T> {
    fn call(&mut self, value: &mut T, children: Vec<&mut T>) -> Result<(), Box<dyn Error>>;
}

impl<T, F: FnMut(&mut T, Vec<&mut T>) -> Result<(), Box<dyn Error>>> PreAction<T> for F {
    fn call(&mut self, value: &mut T, children: Vec<&mut T>) -> Result<(), Box<dyn Error>> {
        self(value, children)
    }
}


pub trait PostAction<T, R> {
    fn call(&mut self, value: &mut T, children: Vec<R>) -> Result<R, Box<dyn Error>>;
}

impl<T, R, F: FnMut(&mut T, Vec<R>) -> Result<R, Box<dyn Error>>> PostAction<T, R> for F {
    fn call(&mut self, value: &mut T, children: Vec<R>) -> Result<R, Box<dyn Error>> {
        self(value, children)
    }
}


#[derive(Debug)]
pub enum GraphError {
    Cycle{
        ixs: Vec<usize>,
        finished: bool
    },
    NonExistentNode(usize),
    NoRoot,
    StackOverflow,
    Other(Box<dyn Error>),
}


#[cfg(test)]
mod tests;