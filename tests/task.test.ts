import {Task, TaskGraph} from "../src/task";

test("empty TaskGraph has no tasks", () => {
    const tg = new TaskGraph([]);
    expect(Array.from(tg.all_tasks)).toHaveLength(0);
});

test("TaskGraph with one task (with missing fields) constructs properly", () => {
    const tg = new TaskGraph([{id: 123, name: "do something", dependencies: []}]);
    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(1);
    const task = tasks[0];
    expect(task.id).toBe(123)
    expect(task.name).toEqual("do something");
    expect(task.description).toEqual("");
    expect(task.priority).toEqual(0);
    expect(task.effective_priority).toEqual(0);
    expect(task.deadline).toEqual("never");
    expect(task.effective_deadline).toEqual("never");
    expect(task.birthline).toEqual("never");
    expect(task.progress).toEqual("todo");
    expect(task.depends_on).toHaveLength(0);
    expect(task.blocked_by).toHaveLength(0);
});

test("TaskGraph with one task (without missing fields) constructs properly", () => {
    const tg = new TaskGraph([{id: 123,
                               name: "do something",
                               description: "Do something!",
                               priority: -1,
                               deadline: new Date("2025-06-07"),
                               birthline: "never",
                               progress: "doing",
                               dependencies: []}]);
    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(1);
    const task = tasks[0];
    expect(task.id).toBe(123)
    expect(task.name).toEqual("do something");
    expect(task.description).toEqual("Do something!");
    expect(task.priority).toEqual(-1);
    expect(task.effective_priority).toEqual(-1);
    expect(task.deadline).toEqual(new Date("2025-06-07"));
    expect(task.effective_deadline).toEqual(new Date("2025-06-07"));
    expect(task.birthline).toEqual("never");
    expect(task.progress).toEqual("doing");
    expect(task.depends_on).toHaveLength(0);
    expect(task.blocked_by).toHaveLength(0);
});

test("TaskGraph with multiple independent tasks constructs properly", () => {
    const tg = new TaskGraph([{id: 1, name: "do something", dependencies: []},
                              {id: 2, name: "eat an apple", dependencies: []},
                              {id: 3, name: "go to sleep", dependencies: []}]);
    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(3);

    const task1 = tasks[0];
    expect(task1.id).toBe(1)
    expect(task1.name).toEqual("do something");
    expect(task1.effective_priority).toEqual(0);
    expect(task1.effective_deadline).toEqual("never");
    expect(task1.depends_on).toHaveLength(0);
    expect(task1.blocked_by).toHaveLength(0);

    const task2 = tasks[1];
    expect(task2.id).toBe(2)
    expect(task2.name).toEqual("eat an apple");
    expect(task2.effective_priority).toEqual(0);
    expect(task2.effective_deadline).toEqual("never");
    expect(task2.depends_on).toHaveLength(0);
    expect(task2.blocked_by).toHaveLength(0);

    const task3 = tasks[2];
    expect(task3.id).toBe(3)
    expect(task3.name).toEqual("go to sleep");
    expect(task3.effective_priority).toEqual(0);
    expect(task3.effective_deadline).toEqual("never");
    expect(task3.depends_on).toHaveLength(0);
    expect(task3.blocked_by).toHaveLength(0);
});

test("deadlines and priorities propagate correctly (one root)", () => {
    //               +-----------"cook lunch" 2030-02-01 (+5) ---------+
    //               |                                                 |
    //               v                                                 v
    // "buy some food" 2030-02-05 (+8)                  "buy bus pass" 2030-01-30 (-1)
    //               |                                                 |
    //               |                                                 |
    //               +---------->"get some money" never (0) <----------+
    const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2030-02-01"), priority: 5,  dependencies: [1, 2]},
                              {id: 1, name: "buy some food",  deadline: new Date("2030-02-05"), priority: 8,  dependencies: [3]},
                              {id: 2, name: "buy bus pass",   deadline: new Date("2030-01-30"), priority: -1, dependencies: [3]},
                              {id: 3, name: "get some money", deadline: "never",                priority: 0,  dependencies: []}]);
    
    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(4);

    // "cook lunch" doesn't block any other task therefore it remains completely unchanged
    const task0 = tasks[0];
    expect(task0.id).toEqual(0);
    expect(task0.name).toEqual("cook lunch");
    expect(task0.effective_priority).toEqual(5); 
    expect(task0.effective_deadline).toEqual(new Date("2030-02-01"));
    expect(task0.priority).toEqual(5);
    expect(task0.deadline).toEqual(new Date("2030-02-01"));

    const task1 = tasks[1];
    expect(task1.id).toEqual(1);
    expect(task1.name).toEqual("buy some food");
    // "buy some food" blocks "cook lunch" but its priority is greater so it remains the same
    expect(task1.effective_priority).toEqual(8); 
    // "buy some food" blocks "cook lunch" whose deadline is sooner than its own therefore it gets adjusted
    expect(task1.effective_deadline).toEqual(new Date("2030-02-01"));
    // the original priority and deadline don't get modified
    expect(task1.priority).toEqual(8);
    expect(task1.deadline).toEqual(new Date("2030-02-05"));

    const task2 = tasks[2];
    expect(task2.id).toEqual(2);
    expect(task2.name).toEqual("buy bus pass");
    // "buy bus pass" blocks "cook lunch" wich has priority 5 (greater than its own) so it gets priority 5, too
    expect(task2.effective_priority).toEqual(5); 
    // "buy bus pass" blocks "cook lunch" but its deadline is sooner therefore it remains the same
    expect(task2.effective_deadline).toEqual(new Date("2030-01-30"));
    // the original priority and deadline don't get modified
    expect(task2.priority).toEqual(-1);
    expect(task2.deadline).toEqual(new Date("2030-01-30"));

    const task3 = tasks[3];
    expect(task3.id).toEqual(3);
    expect(task3.name).toEqual("get some money");
    // gets the highest priority of the tasks it blocks
    expect(task3.effective_priority).toEqual(8); 
    // gets the soonest deadline of the tasks it blocks
    expect(task3.effective_deadline).toEqual(new Date("2030-01-30"));
    // the original priority and deadline don't get modified
    expect(task3.priority).toEqual(0);
    expect(task3.deadline).toEqual("never");
});

test("deadlines and priorities propagate correctly (multiple roots)", () => {
    //             "eat breakfast" 2025-02-01 (+5)
    //                           |
    //                           v
    //               "make breakfast" never (0)
    //                           |
    //                  +--------+-------+
    //                  |                |
    //                  v                v
    // "buy apples" never (0)         "buy bananas" never (0)
    const tg = new TaskGraph([{id: 0, name: "eat breakfast",  deadline: new Date("2025-02-01"), priority: 5,  dependencies: [1]},
                              {id: 1, name: "make breakfast", deadline: "never",                priority: 0,  dependencies: [2, 3]},
                              {id: 2, name: "buy apples",     deadline: "never",                priority: 0,  dependencies: []},
                              {id: 3, name: "buy bananas",    deadline: "never",                priority: 0,  dependencies: []}]);

    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(4);

    // "eat breakfast" doesn't block any other task therefore it remains completely unchanged
    const task0 = tasks[0];
    expect(task0.id).toEqual(0);
    expect(task0.name).toEqual("eat breakfast");
    expect(task0.effective_priority).toEqual(5); 
    expect(task0.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task0.priority).toEqual(5);
    expect(task0.deadline).toEqual(new Date("2025-02-01"));

    // "make breakfast" blocks "eat breakfast" therefore it inherits its higher priority and sooner deadline
    const task1 = tasks[1];
    expect(task1.id).toEqual(1);
    expect(task1.name).toEqual("make breakfast");
    expect(task1.effective_priority).toEqual(5); 
    expect(task1.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task1.priority).toEqual(0);
    expect(task1.deadline).toEqual("never");

    // "buy apples" blocks "make breakfast" therefore it inherits its (already inherited) higher priority and sooner deadline
    const task2 = tasks[2];
    expect(task2.id).toEqual(2);
    expect(task2.name).toEqual("buy apples");
    expect(task2.effective_priority).toEqual(5); 
    expect(task2.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task2.priority).toEqual(0);
    expect(task2.deadline).toEqual("never");

    // "buy bananas" blocks "make breakfast" therefore it inherits its (already inherited) higher priority and sooner deadline
    const task3 = tasks[3];
    expect(task3.id).toEqual(3);
    expect(task3.name).toEqual("buy bananas");
    expect(task3.effective_priority).toEqual(5); 
    expect(task3.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task3.priority).toEqual(0);
    expect(task3.deadline).toEqual("never");
});

test("trivial circular dependency is detected", () => {
    expect(() => new TaskGraph([{id: 0, name: "think of something clever", dependencies: [0]}])).toThrow("Circular dependencies");
});

test("non-trivial circular dependency is dtected", () => {
    expect(() => new TaskGraph([{id: 0, name: "go shopping", dependencies: [1]}, 
                                {id: 1, name: "fix car",     dependencies: [2]},
                                {id: 2, name: "buy tools",   dependencies: [0]}]))
        .toThrow("Circular dependencies");
});
