import {compare_dates} from "../src/maybedate";

test("if neither date is 'never' then they compare like regular dates", () => {
    const x1 = new Date("2000-01-01");
    const y1 = new Date("2000-01-20");
    expect(compare_dates(x1, y1)).toBeLessThan(0);

    const x2 = new Date("2010-01-01");
    const y2 = new Date("2010-01-01");
    expect(compare_dates(x2, y2)).toEqual(0);

    const x3 = new Date("2020-01-01");
    const y3 = new Date("2000-01-01");
    expect(compare_dates(x3, y3)).toBeGreaterThan(0);
});

test("'never' equals 'never'", () => {
    const x = "never";
    const y = "never";
    expect(compare_dates(x, y)).toEqual(0);
});

test("every regular date is sooner than 'never'", () => {
    const x1 = new Date("2001-02-03");
    const y1 = "never";
    expect(compare_dates(x1, y1)).toBeLessThan(0);

    const x2 = "never";
    const y2 = new Date("2003-02-01");
    expect(compare_dates(x2, y2)).toBeGreaterThan(0);
});
