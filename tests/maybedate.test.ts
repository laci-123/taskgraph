import { DATE_MIN, DATE_MAX, date_to_YMD, date_to_YMD_or } from "../src/maybedate";


test("DATE_MIN is the smallest posible Date", () => {
    expect(new Date(DATE_MIN.getTime()).toString()).not.toEqual("Invalid Date");
    expect(new Date(DATE_MIN.getTime() - 1).toString()).toEqual("Invalid Date");
});

test("DATE_MAX is the largest posible Date", () => {
    expect(new Date(DATE_MAX.getTime()).toString()).not.toEqual("Invalid Date");
    expect(new Date(DATE_MAX.getTime() + 1).toString()).toEqual("Invalid Date");
});

test("YYYY-MM-DD representation of date", () => {
    expect(date_to_YMD(new Date("2024-05-06"))).toEqual("2024-05-06");
});

test("YYYY-MM-DD representation of date with DATE_MIN and DATE_MAX values", () => {
    expect(date_to_YMD_or(new Date("2025-06-07"), "before everything", "after everything")).toEqual("2025-06-07");
    expect(date_to_YMD_or(DATE_MIN, "before everything", "after everything")).toEqual("before everything");
    expect(date_to_YMD_or(DATE_MAX, "before everything", "after everything")).toEqual("after everything");
});
