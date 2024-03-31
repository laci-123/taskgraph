import {Task, compare_tasks} from "../src/task";


test("when neither task is close to its deadline, they are ordered by priority then deadline", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 10, new Date("2010-11-12"));
    const task2 = new Task(2, "b", "", 5,   "never");
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, new Date("2010-11-12"));
    const task4 = new Task(4, "b", "", 5,     "never");
    expect(comparator(task3, task4)).toBeGreaterThan(0);

    const task5 = new Task(5, "a", "", 10, new Date("2010-11-12"));
    const task6 = new Task(6, "b", "", 10, "never");
    expect(comparator(task5, task6)).toBeLessThan(0);

    const task7 = new Task(7, "a", "", 10, new Date("2010-11-12"));
    const task8 = new Task(8, "b", "", 10, new Date("2001-12-30"));
    expect(comparator(task7, task8)).toBeGreaterThan(0);

    const task9  = new Task(9,  "a", "", 10, new Date("2010-11-12"));
    const task10 = new Task(10, "b", "", 10, new Date("2010-11-12"));
    expect(comparator(task9, task10)).toEqual(0);
});

test("when one task is close to its deadline and an other isn't, the close one is orderd first", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 0,   new Date("2000-01-01"));
    const task2 = new Task(2, "b", "", 10, "never");
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, new Date("2010-11-12"));
    const task4 = new Task(4, "b", "", -10, new Date("2000-01-01"));
    expect(comparator(task3, task4)).toBeGreaterThan(0);
});

test("when both tasks are close to their deadlines, they are ordered by priority then deadline", () => {
    const one_day = 24 * 60 * 60 * 1000;
    const comparator = compare_tasks(new Date("2000-01-01"), one_day); 

    const task1 = new Task(1, "a", "", 10, new Date("2000-01-01"));
    const task2 = new Task(2, "b", "", 5,   new Date("1999-12-30"));
    expect(comparator(task1, task2)).toBeLessThan(0);

    const task3 = new Task(3, "a", "", -10, new Date("2000-01-01"));
    const task4 = new Task(4, "b", "", 5,     new Date("1999-12-30"));
    expect(comparator(task3, task4)).toBeGreaterThan(0);

    const task5 = new Task(5, "a", "", 10, new Date("2000-01-01"));
    const task6 = new Task(6, "b", "", 10, new Date("1999-12-30"));
    expect(comparator(task5, task6)).toBeGreaterThan(0);

    const task7 = new Task(7, "a", "", 10, new Date("1999-12-30"));
    const task8 = new Task(8, "b", "", 10, new Date("2000-01-01"));
    expect(comparator(task7, task8)).toBeLessThan(0);

    const task9  = new Task(9,  "a", "", 10, new Date("2000-01-01"));
    const task10 = new Task(10, "b", "", 10, new Date("2000-01-01"));
    expect(comparator(task9, task10)).toEqual(0);
});
