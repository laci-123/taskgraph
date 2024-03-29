import {Counter} from "../src/counter";

test("new Counter has default value", () => {
    const counter1 = new Counter(0);
    expect(counter1.get_value()).toBe(0);

    const counter2 = new Counter(10);
    expect(counter2.get_value()).toBe(10);

    const counter3 = new Counter(-17);
    expect(counter3.get_value()).toBe(-17);
});

test("increase increases Counter value", () => {
    const counter = new Counter(20);
    counter.increase(2);
    expect(counter.get_value()).toBe(22);
});
