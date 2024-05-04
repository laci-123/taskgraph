use std::{cell::UnsafeCell, collections::{hash_set, HashMap, HashSet}, error::Error, hash::Hash};


#[derive(Default, PartialEq, Eq)]
enum Color {
    #[default]
    White,
    Gray,
    Black,
    Red,
}

#[derive(Default)]
struct Node<T, Ix = usize> {
    value: T,
    parents: HashSet<Ix>,
    children: HashSet<Ix>,
    color: Color,
}

#[derive(Default)]
pub struct Graph<T, Ix = usize> {
    nodes: HashMap<Ix, UnsafeCell<Node<T, Ix>>>,
}

const MAX_CALL_DEPTH: usize = 1000;

impl<T, Ix: Eq + Hash + Copy> Graph<T, Ix> {
    pub fn add_node(&mut self, value: T) {
        let index = self.smallest_available_index();
        self.nodes.insert(index, UnsafeCell::new(Node {
            value,
            parents: HashSet::default(),
            children: HashSet::default(),
            color: Color::default()
        }));
    }

    fn smallest_available_index(&self) -> Ix {
        let length = self.nodes.len();
        for i in 0 .. length {
            if !self.nodes.contains_key(i) {
                return i;
            }
        }

        length
    }

    pub fn add_edge(&mut self, from: Ix, to: Ix) -> Result<(), GraphError<Ix>> {
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
        if from_node.get_mut().children.contains(&to) {
            return Err(GraphError::Cycle{ixs: vec![from, to], finished: true});
        }
        from_node.get_mut().children.insert(to);

        let to_node  = self.nodes.get_mut(&to).unwrap();
        to_node.get_mut().parents.insert(from);

        Ok(())
    }

    pub fn remove(&mut self, index: Ix) {
        self.nodes.remove(&index);
        for node in self.nodes.values_mut() {
            node.get_mut().children.remove(&index);
            node.get_mut().parents.remove(&index);
        }
    }
    
    pub fn get(&self, index: Ix) -> Result<&T, GraphError<Ix>> {
        // SAFE: `get`, `get_mut`, `get_children` and `get_parents` are the only methods that
        //       can release references to nodes to public code.
        //       They take `&self` and `&mut self` properly therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| &node.value)
        }
    }

    pub fn get_mut(&mut self, index: Ix) -> Result<&mut T, GraphError<Ix>> {
        // SAFE: `get`, `get_mut`, `get_children` and `get_parents` are the only methods that
        //       can release references to nodes to public code.
        //       They take `&self` and `&mut self` properly therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node_mut(index).map(|node| &mut node.value)
        }
    }

    pub fn get_children(&self, index: Ix) -> Result<hash_set::Iter<Ix>, GraphError<Ix>> {
        // SAFE: `get`, `get_mut`, `get_children` and `get_parents` are the only methods that
        //       can release references to nodes to public code.
        //       They take `&self` and `&mut self` properly therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| node.children.iter())
        }
    }

    pub fn get_parents(&self, index: Ix) -> Result<hash_set::Iter<Ix>, GraphError<Ix>> {
        // SAFE: `get`, `get_mut`, `get_children` and `get_parents` are the only methods that
        //       can release references to nodes to public code.
        //       They take `&self` and `&mut self` properly therefore the borrow checker can
        //       enforce that there are only one mutable reference or any number of immutable
        //       references to any given node. 
        unsafe {
            self.get_node(index).map(|node| node.parents.iter())
        }
    }

    // SAFETY: Caller should ensure that there are no mutable reference to this particular node
    //         (multiple immutable references are OK).
    unsafe fn get_node(&self, index: Ix) -> Result<&Node<T, Ix>, GraphError<Ix>> {
        let cell = self.nodes.get(&index).ok_or(GraphError::NonExistentNode(index))?;
        Ok(&*cell.get())
    }

    // SAFETY: Caller should ensure that this is the only mutable reference to this particular node.
    unsafe fn get_node_mut(&self, index: Ix) -> Result<&mut Node<T, Ix>, GraphError<Ix>> {
        let cell = self.nodes.get(&index).ok_or(GraphError::NonExistentNode(index))?;
        Ok(&mut *cell.get())
    }

    pub fn depth_first_traverse<R>(&mut self, pre_action: impl PreAction<T>, post_action: impl PostAction<T, R>) -> Result<(), GraphError<Ix>> {
        let roots = self.nodes
                        .iter()
                        .filter(|(_index, node)| {
                            // SAFE: This reference is only alive within this closure
                            //       and there are no other references alive from anywhere
                            //       else either (which is guaranteed because this method
                            //       takes `&mut self`).
                            unsafe {
                                (*node.get()).children.len() != 0
                            }
                        })
                        .map(|(index, _node)| *index);

        for root in roots {
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
            self.dfs(root, &pre_action, &post_action, 0)?;
        }

        Ok(())
    }

    fn dfs<R>(&self, root_ix: Ix, pre_action: &impl PreAction<T>, post_action: &impl PostAction<T, R>, call_depth: usize) -> Result<Option<R>, GraphError<Ix>> {
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
                root_mut.color = Color::Red;
                return Err(GraphError::Cycle{ixs: vec![root_ix], finished: false});
            }
            else if root_mut.color == Color::Black {
                return Ok(None);
            }

            child_ixs = root_mut.children.clone();
            let mut children = Vec::new();
            for child_ix in child_ixs.iter() {
                if *child_ix == root_ix {
                    // This ensures that no reference in `children` can be
                    // of the same node as `root_mut`. 
                    return Err(GraphError::Cycle{ixs: vec![*child_ix, root_ix], finished: true});
                }
                // TODO: filter out duplicate children
                children.push(self.get(*child_ix)?);
            }
            pre_action.call(&mut root_mut.value, children).map_err(|error| GraphError::Other(error))?;
        }

        let mut children = Vec::new();
        for child_ix in child_ixs.iter() {
            // There are no references to any node when `dfs` is called.
            if let Some(r) = self.dfs(*child_ix, pre_action, post_action, call_depth + 1)? {
                children.push(r);
            }
        }

        {
            // SAFE: This reference to this node is only alive within this block
            //       where no other references of this (or any) node are used.
            let root_mut = unsafe {
                self.get_node_mut(root_ix)?
            };

            let return_value =
            match post_action.call(&mut root_mut.value, children).map_err(|error| GraphError::Other(error)) {
                Err(GraphError::Cycle{ixs: mut cycle, finished: false}) => {
                    if root_mut.color == Color::Red {
                        Err(GraphError::Cycle{ixs: cycle, finished: true})
                    }
                    else {
                        cycle.push(root_ix);
                        Err(GraphError::Cycle{ixs: cycle, finished: false})
                    }
                },
                other => other,
            };

            root_mut.color = Color::Black;

            return_value.map(|r| Some(r))
        }
    }
}


pub trait PreAction<T> {
    fn call(&self, value: &mut T, children: Vec<&T>) -> Result<(), Box<dyn Error>>;
}

impl<T, F: Fn(&mut T, Vec<&T>) -> Result<(), Box<dyn Error>>> PreAction<T> for F {
    fn call(&self, value: &mut T, children: Vec<&T>) -> Result<(), Box<dyn Error>> {
        self(value, children)
    }
}


pub trait PostAction<T, R> {
    fn call(&self, value: &mut T, children: Vec<R>) -> Result<R, Box<dyn Error>>;
}

impl<T, R, F: Fn(&mut T, Vec<R>) -> Result<R, Box<dyn Error>>> PostAction<T, R> for F {
    fn call(&self, value: &mut T, children: Vec<R>) -> Result<R, Box<dyn Error>> {
        self(value, children)
    }
}


#[derive(Debug)]
pub enum GraphError<Ix = usize> {
    Cycle{
        ixs: Vec<Ix>,
        finished: bool
    },
    NonExistentNode(Ix),
    StackOverflow,
    Other(Box<dyn Error>),
}
