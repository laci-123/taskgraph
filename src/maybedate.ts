export type MaybeDate = Date | "never";

export function compare_dates(a: MaybeDate, b: MaybeDate): number {
    if(a === "never") {
        if(b === "never") {
            return 0;
        }
        else {
            return +1;
        }
    }
    else {
        if(b === "never") {
            return -1;
        }
        else {
            if(a < b) {
                return -1;
            }
            else if (a > b) {
                return +1;
            }
            else {
                return 0;
            }
        }
    }
}
