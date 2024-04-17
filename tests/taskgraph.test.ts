import {TaskGraph} from "../src/taskgraph";


test("empty TaskGraph has no tasks", () => {
    const tg = new TaskGraph([]);
    expect(tg.all_tasks).toHaveLength(0);
});

test("TaskGraph with one task (with missing fields) constructs properly", () => {
    const tg = new TaskGraph([{id: 123, name: "do something", dependencies: []}]);
    const tasks = tg.all_tasks;
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
    const tasks = tg.all_tasks;
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
    const tasks = tg.all_tasks;
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

test("get task by id", () => {
    const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2030-02-01"), priority: 5,  dependencies: [1, 2]},
                              {id: 1, name: "buy some food",  deadline: new Date("2030-02-05"), priority: 8,  dependencies: [3]},
                              {id: 2, name: "buy a stove",    deadline: new Date("2030-01-30"), priority: -1, dependencies: [3]},
                              {id: 3, name: "get some money", deadline: "never",                priority: 0,  dependencies: []}]);

    const task0 = tg.get_task_by_id(0);
    expect(task0).toBeDefined();
    expect(task0!.name).toEqual("cook lunch");

    const task1 = tg.get_task_by_id(3);
    expect(task1).toBeDefined();
    expect(task1!.name).toEqual("get some money");

    const task2 = tg.get_task_by_id(4);
    expect(task2).not.toBeDefined();
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
    
    const tasks = tg.all_tasks;
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

    const tasks = tg.all_tasks;
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
    const tasks1 = tg1.all_tasks;
    expect(tasks1[0].progress).toEqual("blocked");

    const tg2 = new TaskGraph([{id: 0, name: "write a book",       dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "learn how to write", dependencies: [],     progress: "done"},
                               {id: 2, name: "have a good idea",   dependencies: [],     progress: "todo"}]);
    const tasks2 = tg2.all_tasks;
    expect(tasks2[0].progress).toEqual("blocked");

    const tg3 = new TaskGraph([{id: 0, name: "write a book",       dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "learn how to write", dependencies: [],     progress: "done"},
                               {id: 2, name: "have a good idea",   dependencies: [],     progress: "done"}]);
    const tasks3 = tg3.all_tasks;
    expect(tasks3[0].progress).toEqual("todo");
});

test("failure is propagated", () => {
    const tg = new TaskGraph([{id: 0, name: "eat breakfast",  dependencies: [1]},
                              {id: 1, name: "make breakfast", dependencies: [2, 3]},
                              {id: 2, name: "buy apples",     dependencies: [], progress: "failed"},
                              {id: 3, name: "buy bananas",    dependencies: []}]);

    const tasks = tg.all_tasks;
    expect(tasks[3].progress).toEqual("todo");
    expect(tasks[2].progress).toEqual("failed");
    expect(tasks[1].progress).toEqual("failed");
    expect(tasks[0].progress).toEqual("failed");
});

test("trivial circular dependency is detected", () => {
    expect(() => new TaskGraph([{id: 0, name: "think of something clever", dependencies: [0]}])).toThrow("Circular dependencies");
});

test("non-trivial circular dependency is detected", () => {
    expect(() => new TaskGraph([{id: 0, name: "go shopping", dependencies: [1]}, 
                                {id: 1, name: "fix car",     dependencies: [2]},
                                {id: 2, name: "buy tools",   dependencies: [0]}]))
        .toThrow("Circular dependencies");
});

test("trivial circular dependency is detected whith tasks not part of the circle", () => {
    expect(() => new TaskGraph([{id: 0, name: "go shopping", dependencies: [0]}, 
                                {id: 1, name: "walk the dog"}]))
        .toThrow("Circular dependencies");
});

test("non-trivial circular dependency is detected whith tasks not part of the circle", () => {
    expect(() => new TaskGraph([{id: 0, name: "go shopping", dependencies: [1]}, 
                                {id: 1, name: "fix car",     dependencies: [2]},
                                {id: 2, name: "buy tools",   dependencies: [0]},
                                {id: 3, name: "walk the dog"}]))
        .toThrow("Circular dependencies");
});

test("references to non-existent tasks are detected", () => {
    expect(() => new TaskGraph([{id: 0, name: "catch a unicorn",           dependencies: [1, 100]}, 
                                {id: 1, name: "go to where unicorns live", dependencies: []}]))
        .toThrow("Reference to non-existent task (0 --> 100)");
});

test("agenda lists all actionable tasks", () => {
    const one_day = 24 * 60 * 60 * 1000;

    const tg0 = new TaskGraph([]);
    const agenda0 = tg0.agenda(new Date("2004-05-06"), one_day);
    expect(agenda0).toHaveLength(0);

    const tg1 = new TaskGraph([{id: 0, name: "eat an apple", dependencies: [], progress: "todo"},
                               {id: 1, name: "eat a banana", dependencies: [], progress: "todo"},
                               {id: 2, name: "eat a grape",  dependencies: [], progress: "todo"}]);
    const agenda1 = tg1.agenda(new Date("2004-05-06"), one_day);
    expect(agenda1).toHaveLength(3);

    const tg2 = new TaskGraph([{id: 0, name: "eat an apple", dependencies: [1], progress: "todo"},
                               {id: 1, name: "eat a banana", dependencies: [2], progress: "todo"},
                               {id: 2, name: "eat a grape",  dependencies: [],  progress: "todo"}]);
    const agenda2 = tg2.agenda(new Date("2004-05-06"), one_day);
    expect(agenda2).toHaveLength(1);
    expect(agenda2[0].name).toEqual("eat a grape");

    const tg3 = new TaskGraph([{id: 0, name: "eat an apple", dependencies: [1], progress: "todo"},
                               {id: 1, name: "eat a banana", dependencies: [2], progress: "todo"},
                               {id: 2, name: "eat a grape",  dependencies: [],  progress: "failed"}]);
    const agenda3 = tg3.agenda(new Date("2004-05-06"), one_day);
    expect(agenda3).toHaveLength(0);

    const tg4 = new TaskGraph([{id: 0, name: "eat an apple", dependencies: [],  progress: "done"},
                               {id: 1, name: "eat a banana", dependencies: [],  progress: "done"},
                               {id: 2, name: "eat a grape",  dependencies: [],  progress: "done"}]);
    const agenda4 = tg4.agenda(new Date("2004-05-06"), one_day);
    expect(agenda4).toHaveLength(0);

    const tg5 = new TaskGraph([{id: 0, name: "eat an apple", dependencies: [1, 2], progress: "todo"},
                               {id: 1, name: "eat a banana", dependencies: [],     progress: "done"},
                               {id: 2, name: "eat a grape",  dependencies: [],     progress: "done"}]);
    const agenda5 = tg5.agenda(new Date("2004-05-06"), one_day);
    expect(agenda5).toHaveLength(1);
    expect(agenda5[0].name).toEqual("eat an apple");
});

test("agenda lists tasks in right order", () => {
    const one_day = 24 * 60 * 60 * 1000;

    const tg0 = new TaskGraph([{id: 0, name: "fix car",      dependencies: [],  progress: "todo", priority: 1},
                               {id: 1, name: "buy hammer",   dependencies: [],  progress: "todo", priority: 0},
                               {id: 2, name: "go shopping",  dependencies: [],  progress: "todo", priority: 10},
                               {id: 3, name: "buy bus pass", dependencies: [],  progress: "todo", priority: -1}]);
    const agenda0 = tg0.agenda(new Date("2004-05-06"), one_day);
    expect(agenda0).toHaveLength(4);
    expect(agenda0[0].name).toEqual("go shopping");
    expect(agenda0[1].name).toEqual("fix car");
    expect(agenda0[2].name).toEqual("buy hammer");
    expect(agenda0[3].name).toEqual("buy bus pass");

    const tg1 = new TaskGraph([{id: 0, name: "fix car",      dependencies: [1], progress: "todo", priority: 1},
                               {id: 1, name: "buy hammer",   dependencies: [],  progress: "todo", priority: 0},
                               {id: 2, name: "go shopping",  dependencies: [3], progress: "todo", priority: 10},
                               {id: 3, name: "buy bus pass", dependencies: [],  progress: "todo", priority: -1}]);
    const agenda1 = tg1.agenda(new Date("2004-05-06"), one_day);
    expect(agenda1).toHaveLength(2);
    expect(agenda1[0].name).toEqual("buy bus pass");
    expect(agenda1[1].name).toEqual("buy hammer");

    const tg2 = new TaskGraph([{id: 0, name: "fix car",      dependencies: [1], progress: "todo", priority: 1,  deadline: new Date("2004-05-05")},
                               {id: 1, name: "buy hammer",   dependencies: [],  progress: "todo", priority: 0,  deadline: "never"},
                               {id: 2, name: "go shopping",  dependencies: [3], progress: "todo", priority: 10, deadline: new Date("2004-05-10")},
                               {id: 3, name: "buy bus pass", dependencies: [],  progress: "todo", priority: -1, deadline: "never"}]);
    const agenda2 = tg2.agenda(new Date("2004-05-06"), one_day);
    expect(agenda2).toHaveLength(2);
    expect(agenda2[0].name).toEqual("buy hammer");
    expect(agenda2[1].name).toEqual("buy bus pass");

    const tg3 = new TaskGraph([{id: 0, name: "fix car",      dependencies: [],  progress: "todo", priority: 1,  deadline: new Date("2004-05-20")},
                               {id: 1, name: "buy hammer",   dependencies: [],  progress: "todo", priority: 0,  deadline: new Date("2004-05-21")},
                               {id: 2, name: "go shopping",  dependencies: [],  progress: "todo", priority: 10, deadline: new Date("2004-05-22")},
                               {id: 3, name: "buy bus pass", dependencies: [],  progress: "todo", priority: -1, deadline: new Date("2004-05-23")}]);
    const agenda3 = tg3.agenda(new Date("2004-05-06"), one_day);
    expect(agenda3).toHaveLength(4);
    expect(agenda3[0].name).toEqual("go shopping");
    expect(agenda3[1].name).toEqual("fix car");
    expect(agenda3[2].name).toEqual("buy hammer");
    expect(agenda3[3].name).toEqual("buy bus pass");

    const tg4 = new TaskGraph([{id: 0, name: "fix car",      dependencies: [],  progress: "todo", priority: 1, deadline: new Date("2004-05-20")},
                               {id: 1, name: "buy hammer",   dependencies: [],  progress: "todo", priority: 1, deadline: "never"},
                               {id: 2, name: "go shopping",  dependencies: [],  progress: "todo", priority: 1, deadline: new Date("2004-05-22")},
                               {id: 3, name: "buy bus pass", dependencies: [],  progress: "todo", priority: 1, deadline: new Date("2004-05-23")}]);
    const agenda4 = tg4.agenda(new Date("2004-05-06"), one_day);
    expect(agenda4).toHaveLength(4);
    expect(agenda4[0].name).toEqual("fix car");
    expect(agenda4[1].name).toEqual("go shopping");
    expect(agenda4[2].name).toEqual("buy bus pass");
    expect(agenda4[3].name).toEqual("buy hammer");
});

test("smallest available id", () => {
    const tg0 = new TaskGraph([]);
    expect(tg0.smallest_available_id).toEqual(0);

    const tg1 = new TaskGraph([{id: 0, name: "a"}]);
    expect(tg1.smallest_available_id).toEqual(1);

    const tg2 = new TaskGraph([{id: 10, name: "a"}]);
    expect(tg2.smallest_available_id).toEqual(0);

    const tg3 = new TaskGraph([{id: 0, name: "a"}, {id: 1, name: "b"}, {id: 2, name: "c"}]);
    expect(tg3.smallest_available_id).toEqual(3);

    const tg4 = new TaskGraph([{id: 0, name: "a"}, {id: 1, name: "b"}, {id: 2, name: "c"}, {id: 4, name: "e"}]);
    expect(tg4.smallest_available_id).toEqual(3);
});

test("create TaskGraph from JSON", () => {
    const json0 = '[]';
    expect(TaskGraph.from_json(json0).all_tasks.length).toEqual(0);

    const json1 = '[{"id": 0, "name": "abc"}, {"id": 1, "name": "def ghi", "progress": 10}]';
    expect(TaskGraph.from_json(json1).all_tasks.length).toEqual(2);

    const json2 = '[{"id": 0, "name": "abc"}, {"id": 0, "name": "def ghi"}]';
    expect(TaskGraph.from_json(json2).all_tasks.length).toEqual(1);

    const json3 = '[{"id": 0, "name": ]';
    expect(() => TaskGraph.from_json(json3)).toThrow("cannot create TaskGraph from JSON");

    const json4 = '[{"progress": 4}, {"id": 1, "name": "def ghi", "progress": 10}]';
    expect(() => TaskGraph.from_json(json4)).toThrow("cannot create TaskGraph from JSON");

    const json5 = '{"id": 1, "name": "def ghi", "progress": 10}';
    expect(() => TaskGraph.from_json(json5)).toThrow("cannot create TaskGraph from JSON");
});

test("create TaskGraph from pretty printed JSON", () => {
    const json0 = `
[
    {
        "id": 0,
        "name": "buy stuff",
        "deadline": "2024-04-15T00:00:00.000Z",
        "dependencies": [
            1
        ]
    },
    {
        "id": 1,
        "name": "go shopping"
    }
]`
    expect(TaskGraph.from_json(json0).all_tasks.length).toEqual(2);
});

test("convert TaskGraph to JSON", () => {
    const tg0 = new TaskGraph([]);
    expect(tg0.to_json()).toEqual("[]");

    const tg1 = new TaskGraph([{id: 0, name: "abc"}]);
    expect(tg1.to_json()).toEqual('[{"id":0,"name":"abc"}]');

    const tg2 = new TaskGraph([{id: 0, name: "abc", priority: 0, deadline: "never"}, {id: 1, name: "def", dependencies: [0]}]);
    expect(tg2.to_json()).toEqual('[{"id":0,"name":"abc"},{"id":1,"name":"def","dependencies":[0]}]');
});
