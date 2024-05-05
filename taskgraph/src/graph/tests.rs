use super::*;
use pretty_assertions::assert_eq;

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