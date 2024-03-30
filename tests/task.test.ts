import {Task, TaskGraph, compare_tasks} from "../src/task";

test("when neither task is close to its deadline, they are ordered by priority then deadline", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 10, 10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task2 = new Task(2, "b", "", 5, 5,   "never", "never");
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, -10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task4 = new Task(4, "b", "", 5, 5,     "never", "never");
    expect(comparator(task3, task4)).toBeGreaterThan(0);

    const task5 = new Task(5, "a", "", 10, 10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task6 = new Task(6, "b", "", 10, 10, "never", "never");
    expect(comparator(task5, task6)).toBeLessThan(0);

    const task7 = new Task(7, "a", "", 10, 10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task8 = new Task(8, "b", "", 10, 10, new Date("2001-12-30"), new Date("2001-12-30"));
    expect(comparator(task7, task8)).toBeGreaterThan(0);

    const task9  = new Task(9,  "a", "", 10, 10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task10 = new Task(10, "b", "", 10, 10, new Date("2010-11-12"), new Date("2010-11-12"));
    expect(comparator(task9, task10)).toEqual(0);
});

test("when one task is close to its deadline and an other isn't, the close one is orderd first", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 0, 0,   new Date("2000-01-01"), new Date("2000-01-01"));
    const task2 = new Task(2, "b", "", 10, 10, "never", "never");
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, -10, new Date("2010-11-12"), new Date("2010-11-12"));
    const task4 = new Task(4, "b", "", -10, -10, new Date("2000-01-01"), new Date("2000-01-01"));
    expect(comparator(task3, task4)).toBeGreaterThan(0);
});

test("when both tasks are close to their deadlines, they are ordered by priority then deadline", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 10, 10, new Date("2000-01-01"), new Date("2000-01-01"));
    const task2 = new Task(2, "b", "", 5, 5,   new Date("1999-12-30"), new Date("1999-12-30"));
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, -10, new Date("2000-01-01"), new Date("2000-01-01"));
    const task4 = new Task(4, "b", "", 5, 5,     new Date("1999-12-30"), new Date("1999-12-30"));
    expect(comparator(task3, task4)).toBeGreaterThan(0);

    const task5 = new Task(5, "a", "", 10, 10, new Date("2000-01-01"), new Date("2000-01-01"));
    const task6 = new Task(6, "b", "", 10, 10, new Date("1999-12-30"), new Date("1999-12-30"));
    expect(comparator(task5, task6)).toBeGreaterThan(0);

    const task7 = new Task(7, "a", "", 10, 10, new Date("1999-12-30"), new Date("1999-12-30"));
    const task8 = new Task(8, "b", "", 10, 10, new Date("2000-01-01"), new Date("2000-01-01"));
    expect(comparator(task7, task8)).toBeLessThan(0);

    const task9  = new Task(9,  "a", "", 10, 10, new Date("2000-01-01"), new Date("2000-01-01"));
    const task10 = new Task(10, "b", "", 10, 10, new Date("2000-01-01"), new Date("2000-01-01"));
    expect(comparator(task9, task10)).toEqual(0);
});

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
    expect(task.needed_by).toHaveLength(0);
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
    expect(task.needed_by).toHaveLength(0);
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
    expect(task1.needed_by).toHaveLength(0);

    const task2 = tasks[1];
    expect(task2.id).toBe(2)
    expect(task2.name).toEqual("eat an apple");
    expect(task2.effective_priority).toEqual(0);
    expect(task2.effective_deadline).toEqual("never");
    expect(task2.depends_on).toHaveLength(0);
    expect(task2.needed_by).toHaveLength(0);

    const task3 = tasks[2];
    expect(task3.id).toBe(3)
    expect(task3.name).toEqual("go to sleep");
    expect(task3.effective_priority).toEqual(0);
    expect(task3.effective_deadline).toEqual("never");
    expect(task3.depends_on).toHaveLength(0);
    expect(task3.needed_by).toHaveLength(0);
});

test("deadlines and priorities propagate correctly (one root)", () => {
    //               +-----------"cook lunch" 2030-02-01 (+5) ---------+
    //               |                                                 |
    //               v                                                 v
    // "buy some food" 2030-02-05 (+8)                  "buy a stove" 2030-01-30 (-1)
    //               |                                                 |
    //               |                                                 |
    //               +---------->"get some money" never (0) <----------+
    const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2030-02-01"), priority: 5,  dependencies: [1, 2]},
                              {id: 1, name: "buy some food",  deadline: new Date("2030-02-05"), priority: 8,  dependencies: [3]},
                              {id: 2, name: "buy a stove",    deadline: new Date("2030-01-30"), priority: -1, dependencies: [3]},
                              {id: 3, name: "get some money", deadline: "never",                priority: 0,  dependencies: []}]);
    
    const tasks = Array.from(tg.all_tasks);
    expect(tasks).toHaveLength(4);

    // "cook lunch" is not needed by any other task therefore it remains completely unchanged
    const task0 = tasks[0];
    expect(task0.id).toEqual(0);
    expect(task0.name).toEqual("cook lunch");
    expect(task0.effective_priority).toEqual(5); 
    expect(task0.effective_deadline).toEqual(new Date("2030-02-01"));
    expect(task0.priority).toEqual(5);
    expect(task0.deadline).toEqual(new Date("2030-02-01"));
    // ...apart from being blocked (because it has unfinished dependencies)
    expect(task0.progress).toEqual("blocked");

    const task1 = tasks[1];
    expect(task1.id).toEqual(1);
    expect(task1.name).toEqual("buy some food");
    // "buy some food" is needed by "cook lunch" but its priority is greater so it remains the same
    expect(task1.effective_priority).toEqual(8); 
    // "buy some food" is needed by "cook lunch" whose deadline is sooner than its own therefore it gets adjusted
    expect(task1.effective_deadline).toEqual(new Date("2030-02-01"));
    // the original priority and deadline don't get modified
    expect(task1.priority).toEqual(8);
    expect(task1.deadline).toEqual(new Date("2030-02-05"));
    expect(task0.progress).toEqual("blocked");

    const task2 = tasks[2];
    expect(task2.id).toEqual(2);
    expect(task2.name).toEqual("buy a stove");
    // "buy a stove" is needed by "cook lunch" wich has priority 5 (greater than its own) so it gets priority 5, too
    expect(task2.effective_priority).toEqual(5); 
    // "buy a stove" is needed by "cook lunch" but its deadline is sooner therefore it remains the same
    expect(task2.effective_deadline).toEqual(new Date("2030-01-30"));
    // the original priority and deadline don't get modified
    expect(task2.priority).toEqual(-1);
    expect(task2.deadline).toEqual(new Date("2030-01-30"));
    expect(task0.progress).toEqual("blocked");

    const task3 = tasks[3];
    expect(task3.id).toEqual(3);
    expect(task3.name).toEqual("get some money");
    // gets the highest priority of the two tasks it is needed by
    expect(task3.effective_priority).toEqual(8); 
    // gets the soonest deadline of the two tasks it is needed by
    expect(task3.effective_deadline).toEqual(new Date("2030-01-30"));
    // the original priority and deadline don't get modified
    expect(task3.priority).toEqual(0);
    expect(task3.deadline).toEqual("never");
    expect(task3.progress).toEqual("todo");
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

    // "eat breakfast" is not needed by any other task therefore it remains completely unchanged
    const task0 = tasks[0];
    expect(task0.id).toEqual(0);
    expect(task0.name).toEqual("eat breakfast");
    expect(task0.effective_priority).toEqual(5); 
    expect(task0.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task0.priority).toEqual(5);
    expect(task0.deadline).toEqual(new Date("2025-02-01"));
    // ...apart from being blocked (because it has unfinished dependencies)
    expect(task0.progress).toEqual("blocked");

    // "make breakfast" is needed by "eat breakfast" therefore it inherits its higher priority and sooner deadline
    const task1 = tasks[1];
    expect(task1.id).toEqual(1);
    expect(task1.name).toEqual("make breakfast");
    expect(task1.effective_priority).toEqual(5); 
    expect(task1.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task1.priority).toEqual(0);
    expect(task1.deadline).toEqual("never");
    expect(task0.progress).toEqual("blocked");

    // "buy apples" is needed by "make breakfast" therefore it inherits its (already inherited) higher priority and sooner deadline
    const task2 = tasks[2];
    expect(task2.id).toEqual(2);
    expect(task2.name).toEqual("buy apples");
    expect(task2.effective_priority).toEqual(5); 
    expect(task2.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task2.priority).toEqual(0);
    expect(task2.deadline).toEqual("never");
    expect(task2.progress).toEqual("todo");

    // "buy bananas" is needed by "make breakfast" therefore it inherits its (already inherited) higher priority and sooner deadline
    const task3 = tasks[3];
    expect(task3.id).toEqual(3);
    expect(task3.name).toEqual("buy bananas");
    expect(task3.effective_priority).toEqual(5); 
    expect(task3.effective_deadline).toEqual(new Date("2025-02-01"));
    expect(task3.priority).toEqual(0);
    expect(task3.deadline).toEqual("never");
    expect(task3.progress).toEqual("todo");
});

test("task is unblocked if and only if all of its dependencies are DONE", () => {
    const tg1 = new TaskGraph([{id: 0, name: "write a book",       dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "learn how to write", dependencies: [],     progress: "todo"},
                               {id: 2, name: "have a good idea",   dependencies: [],     progress: "todo"}]);
    const tasks1 = Array.from(tg1.all_tasks);
    expect(tasks1[0].progress).toEqual("blocked");

    const tg2 = new TaskGraph([{id: 0, name: "write a book",       dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "learn how to write", dependencies: [],     progress: "done"},
                               {id: 2, name: "have a good idea",   dependencies: [],     progress: "todo"}]);
    const tasks2 = Array.from(tg2.all_tasks);
    expect(tasks2[0].progress).toEqual("blocked");

    const tg3 = new TaskGraph([{id: 0, name: "write a book",       dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "learn how to write", dependencies: [],     progress: "done"},
                               {id: 2, name: "have a good idea",   dependencies: [],     progress: "done"}]);
    const tasks3 = Array.from(tg3.all_tasks);
    expect(tasks3[0].progress).toEqual("todo");
});

test("failure is propagated", () => {
    const tg = new TaskGraph([{id: 0, name: "eat breakfast",  dependencies: [1]},
                              {id: 1, name: "make breakfast", dependencies: [2, 3]},
                              {id: 2, name: "buy apples",     dependencies: [], progress: "failed"},
                              {id: 3, name: "buy bananas",    dependencies: []}]);

    const tasks = Array.from(tg.all_tasks);
    expect(tasks[3].progress).toEqual("todo");
    expect(tasks[2].progress).toEqual("failed");
    expect(tasks[1].progress).toEqual("failed");
    expect(tasks[0].progress).toEqual("failed");
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

test("references to non-existent tasks are detected", () => {
    expect(() => new TaskGraph([{id: 0, name: "catch a unicorn",           dependencies: [1, 100]}, 
                                {id: 1, name: "go to where unicorns live", dependencies: []}]))
        .toThrow("Reference to non-existent task (0 --> 100)");
});
