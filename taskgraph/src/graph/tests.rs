use crate::utils::assert_eq_json;

use super::*;
use pretty_assertions::assert_eq;
use serde_json::json;
use thiserror::Error;

#[test]
fn graph_default() {
    let graph: Graph<i32> = Graph::default();
    assert_eq!(graph.len(), 0);
}

#[test]
fn add_node() {
    let mut graph = Graph::default();
    let one = graph.add_node(1);
    let two = graph.add_node(2);
    let ten = graph.add_node(10);
    assert_eq!(graph.len(), 3);
    assert_eq!(one, 0);
    assert_eq!(two, 1);
    assert_eq!(ten, 2);
}

#[test]
fn get() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(10);
    let n1 = graph.add_node(20);
    let n2 = graph.add_node(30);
    assert_eq!(*graph.get(n0).unwrap(), 10);
    assert_eq!(*graph.get(n1).unwrap(), 20);
    assert_eq!(*graph.get(n2).unwrap(), 30);
}

#[test]
fn get_nonexistent() {
    let mut graph = Graph::default();
    graph.add_node(-1);
    graph.add_node(-2);
    let x = graph.get(1000);
    assert!(matches!(x, Err(GraphError::NonExistentNode(1000))));
}

#[test]
fn get_mut() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(0);
    let x = graph.get_mut(n0).unwrap();
    *x = 13;
    assert_eq!(*graph.get(n0).unwrap(), 13);
}

#[test]
fn remove_node() {
    let mut graph = Graph::default();
    let _one = graph.add_node(1);
    let  two = graph.add_node(2);
    let _ten = graph.add_node(10);
    assert_eq!(graph.len(), 3);

    graph.remove(two);
    assert_eq!(graph.len(), 2);

    let six = graph.add_node(6);
    assert_eq!(six, 1); // smallest available index after deletion
}

#[test]
fn remove_nonexistent_node() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(10);
    let n1 = graph.add_node(20);
    let n2 = graph.add_node(30);

    graph.remove(1000); // nothing should happen

    assert_eq!(graph.len(), 3);
    assert_eq!(*graph.get(n0).unwrap(), 10);
    assert_eq!(*graph.get(n1).unwrap(), 20);
    assert_eq!(*graph.get(n2).unwrap(), 30);
}

fn iter_to_set(iter: Result<hash_set::Iter<usize>, GraphError>) -> HashSet<usize> {
    iter.unwrap().map(|i| *i).collect()
}

#[test]
fn edges() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(10);
    let n1 = graph.add_node(20);
    let n2 = graph.add_node(30);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();

    assert_eq!(iter_to_set(graph.get_children(n0)), HashSet::from([1, 2]));
    assert_eq!(iter_to_set(graph.get_children(n1)), HashSet::from([]));
    assert_eq!(iter_to_set(graph.get_children(n2)), HashSet::from([]));

    assert_eq!(iter_to_set(graph.get_parents(n0)), HashSet::from([]));
    assert_eq!(iter_to_set(graph.get_parents(n1)), HashSet::from([0]));
    assert_eq!(iter_to_set(graph.get_parents(n2)), HashSet::from([0]));
}

#[test]
fn edges_between_nonexistent_nodes() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(10);
    let n1 = graph.add_node(20);
    graph.add_node(30);
    assert!(matches!(graph.add_edge(n0, 100), Err(GraphError::NonExistentNode(100))));
    assert!(matches!(graph.add_edge(100, n1), Err(GraphError::NonExistentNode(100))));
    assert!(matches!(graph.add_edge(100, 200), Err(GraphError::NonExistentNode(100))));
}

#[test]
fn edges_with_cycles() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(10);
    let n1 = graph.add_node(20);
    let n2 = graph.add_node(30);
    match graph.add_edge(n0, n0) {
        Err(GraphError::Cycle { ixs, finished }) => {
            assert_eq!(ixs, vec![0]);
            assert_eq!(finished, true);
        },
        _ => panic!("graph.add_edge(n0, n0) shoud have faild"),
    }
    graph.add_edge(n0, n1).unwrap();
    match graph.add_edge(n1, n0) {
        Err(GraphError::Cycle { ixs, finished }) => {
            assert_eq!(ixs, vec![1, 0]);
            assert_eq!(finished, true);
        },
        _ => panic!("graph.add_edge(n1, n0) shoud have faild"),
    }
    graph.add_edge(n1, n2).unwrap();
    graph.add_edge(n2, n0).unwrap(); // No error: `add_edge` can only detect trival cycles.
}

#[test]
fn dfs_empty() {
    let mut graph: Graph<i32> = Graph::default();
    graph.depth_first_traverse(|_value: &mut i32, _children: Vec<&mut i32>| Ok(()), |_value: &mut i32, _children: Vec<i32>| Ok(3)).unwrap();
    // nothing shoud happen
}

#[test]
fn dfs_one_node() {
    let mut graph = Graph::default();
    graph.add_node(3);

    graph.depth_first_traverse(|value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        assert_eq!(*value, 3); 
        assert_eq!(children.len(), 0); 
        *value = 5;
        Ok(())
    }, 
    |value: &mut i32, children: Vec<i32>| {
        // postorder
        assert_eq!(*value, 5);
        assert_eq!(children.len(), 0);
        *value = 11;
        Ok(100)
    }).unwrap();

    assert_eq!(*graph.get(0).unwrap(), 11);
}

#[test]
fn dfs_simple() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    let n2 = graph.add_node(-2);
    let n3 = graph.add_node(7);
    let n4 = graph.add_node(4);
    let n5 = graph.add_node(11);
    let n6 = graph.add_node(0);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();
    graph.add_edge(n1, n3).unwrap();
    graph.add_edge(n1, n4).unwrap();
    graph.add_edge(n2, n5).unwrap();
    graph.add_edge(n2, n6).unwrap();
    //            n0(3)
    //          /       \
    //    n1(10)         n2(-2)
    //     /  \           /  \
    // n3(7)  n4(4)  n5(11)  n6(0)

    let mut inner_nodes = HashSet::new();
    let mut leaves = HashSet::new();

    graph.depth_first_traverse(|value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        if children.len() == 0 {
            leaves.insert(*value);
        }
        else {
            inner_nodes.insert(*value);
        }
        Ok(())
    }, 
    |value: &mut i32, children: Vec<i32>| {
        // postorder
        // Move maximum value into the root.
        if let Some(max_child) = children.iter().max() {
            if *max_child > *value {
                *value = *max_child;
            }
        }
        Ok(*value)
    }).unwrap();

    assert_eq!(inner_nodes, HashSet::from([3, 10, -2]));
    assert_eq!(leaves,      HashSet::from([7, 4, 11, 0]));
    assert_eq!(*graph.get(0).unwrap(), 11);
}

#[test]
fn dfs_cycle_error() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    let n2 = graph.add_node(-2);
    let n3 = graph.add_node(7);
    let n4 = graph.add_node(4);
    let n5 = graph.add_node(11);
    let n6 = graph.add_node(0);
    let n7 = graph.add_node(9);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();
    graph.add_edge(n1, n3).unwrap();
    graph.add_edge(n1, n4).unwrap();
    graph.add_edge(n2, n5).unwrap();
    graph.add_edge(n2, n6).unwrap();
    graph.add_edge(n6, n7).unwrap();
    graph.add_edge(n7, n2).unwrap();
    //            n0(3) 
    //          /       \ 
    //    n1(10)         n2(-2)a <---+
    //     /  \           /  \       |
    // n3(7)  n4(4)  n5(11)  n6(0)   |
    //                        |      |
    //                       n7(9) --+

    let mut inner_nodes = HashSet::new();
    let mut leaves = HashSet::new();

    let result =
    graph.depth_first_traverse(|value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        if children.len() == 0 {
            leaves.insert(*value);
        }
        else {
            inner_nodes.insert(*value);
        }
        Ok(())
    }, 
    |value: &mut i32, children: Vec<i32>| {
        // postorder
        // Move maximum value into the root.
        if let Some(max_child) = children.iter().max() {
            if *max_child > *value {
                *value = *max_child;
            }
        }
        Ok(*value)
    });

    match result {
        Err(GraphError::Cycle { ixs, finished }) => {
            assert_eq!(ixs, vec![2, 7, 6]);
            assert_eq!(finished, true);
        },
        _ => panic!("graph.depth_first_traverse(...) shuld have faild"),
    }
}

#[test]
fn dfs_error_cycle_no_roots() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    let n2 = graph.add_node(-2);
    let n3 = graph.add_node(7);
    let n4 = graph.add_node(4);
    let n5 = graph.add_node(11);
    let n6 = graph.add_node(0);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();
    graph.add_edge(n1, n3).unwrap();
    graph.add_edge(n1, n4).unwrap();
    graph.add_edge(n2, n5).unwrap();
    graph.add_edge(n2, n6).unwrap();
    graph.add_edge(n6, n0).unwrap();
    //            n0(3) <------------+
    //          /       \            |
    //    n1(10)         n2(-2)a     |
    //     /  \           /  \       |
    // n3(7)  n4(4)  n5(11)  n6(0) --+

    let mut inner_nodes = HashSet::new();
    let mut leaves = HashSet::new();

    let result =
    graph.depth_first_traverse(|value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        if children.len() == 0 {
            leaves.insert(*value);
        }
        else {
            inner_nodes.insert(*value);
        }
        Ok(())
    }, 
    |value: &mut i32, children: Vec<i32>| {
        // postorder
        // Move maximum value into the root.
        if let Some(max_child) = children.iter().max() {
            if *max_child > *value {
                *value = *max_child;
            }
        }
        Ok(*value)
    });

    match result {
        Err(GraphError::Cycle { ixs, finished }) => {
            assert_eq!(ixs, vec![6, 2, 0]);
            assert_eq!(finished, true);
        },
        _ => panic!("graph.depth_first_traverse(...) shuld have faild"),
    }
}

#[derive(Error, Debug)]
enum TestError {
    #[error("Something very bad happend: {0}")]
    Description(String),
}

#[test]
fn dfs_error_from_pre_callback() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    let n2 = graph.add_node(-2);
    let n3 = graph.add_node(7);
    let n4 = graph.add_node(4);
    let n5 = graph.add_node(11);
    let n6 = graph.add_node(0);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();
    graph.add_edge(n1, n3).unwrap();
    graph.add_edge(n1, n4).unwrap();
    graph.add_edge(n2, n5).unwrap();
    graph.add_edge(n2, n6).unwrap();
    //            n0(3)
    //          /       \        
    //    n1(10)         n2(-2)a 
    //     /  \           /  \   
    // n3(7)  n4(4)  n5(11)  n6(0) 

    let result =
    graph.depth_first_traverse(|_value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        if children.len() == 0 {
            Err(Box::new(TestError::Description("Oops!".to_string())) as Box<dyn Error>)
        }
        else {
            Ok(())
        }
    }, 
    |value: &mut i32, _children: Vec<i32>| {
        // postorder
        Ok(*value)
    });

    match result {
        Err(GraphError::Other(err)) => {
            assert_eq!(format!("{}", err), "Something very bad happend: Oops!");
        }
        _ => {
            panic!("graph.depth_first_traverse(...) should have failed");
        }
    }
}

#[test]
fn dfs_error_from_post_callback() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    let n2 = graph.add_node(-2);
    let n3 = graph.add_node(7);
    let n4 = graph.add_node(4);
    let n5 = graph.add_node(11);
    let n6 = graph.add_node(0);
    graph.add_edge(n0, n1).unwrap();
    graph.add_edge(n0, n2).unwrap();
    graph.add_edge(n1, n3).unwrap();
    graph.add_edge(n1, n4).unwrap();
    graph.add_edge(n2, n5).unwrap();
    graph.add_edge(n2, n6).unwrap();
    //            n0(3)
    //          /       \        
    //    n1(10)         n2(-2)a 
    //     /  \           /  \   
    // n3(7)  n4(4)  n5(11)  n6(0) 

    let result =
    graph.depth_first_traverse(|value: &mut i32, children: Vec<&mut i32>| {
        // preorder
        if children.len() == 0 {
            *value = 42;
        }
        Ok(())
    }, 
    |value: &mut i32, _children: Vec<i32>| {
        // postorder
        if *value == 42 {
            Err(Box::new(TestError::Description(":-(".to_string())) as Box<dyn Error>)
        }
        else {
            Ok(*value)
        }
    });

    match result {
        Err(GraphError::Other(err)) => {
            assert_eq!(format!("{}", err), "Something very bad happend: :-(");
        }
        _ => {
            panic!("graph.depth_first_traverse(...) should have failed");
        }
    }
}

#[test]
fn dfs_stackoverflow() {
    let mut graph = Graph::default();
    graph.add_node(0);
    for i in 1 .. 2000 {
        graph.add_node(i);
        graph.add_edge(i, i - 1).unwrap(); 
    }

    let result =
    graph.depth_first_traverse(|_value: &mut usize, _children: Vec<&mut usize>| Ok(()), |_value: &mut usize, _children: Vec<i32>| Ok(3));

    assert!(matches!(result, Err(GraphError::StackOverflow)));
}

#[test]
fn serialize() {
    let mut graph = Graph::default();
    let n0 = graph.add_node(3);
    let n1 = graph.add_node(10);
    graph.add_edge(n0, n1).unwrap();

    let s = serde_json::to_string(&graph).unwrap();
    assert_eq_json(&s, json!({
        "0": {
            "value": 3,
            "parents": [],
            "children": [1]
        },
        "1": {
            "value": 10,
            "parents": [0],
            "children": []
        }
    }));
}

#[test]
fn deserialize() {
    let json_str = r#"
        {
            "0": {
                "value": 3,
                "parents": [],
                "children": [1, 2]
            },
            "1": {
                "value": 10,
                "parents": [0],
                "children": []
            },
            "2": {
                "value": -1,
                "parents": [0],
                "children": []
            }
        }
    "#;

    let graph: Graph<i32> = serde_json::from_str(&json_str).unwrap();
    assert_eq!(*graph.get(0).unwrap(), 3);
    assert_eq!(*graph.get(1).unwrap(), 10);
    assert_eq!(*graph.get(2).unwrap(), -1);
    assert_eq!(iter_to_set(graph.get_children(0)), HashSet::from([1, 2]));
    assert_eq!(iter_to_set(graph.get_children(1)), HashSet::from([]));
    assert_eq!(iter_to_set(graph.get_children(2)), HashSet::from([]));
    assert_eq!(iter_to_set(graph.get_parents(0)), HashSet::from([]));
    assert_eq!(iter_to_set(graph.get_parents(1)), HashSet::from([0]));
    assert_eq!(iter_to_set(graph.get_parents(2)), HashSet::from([0]));
}