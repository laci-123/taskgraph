export type MaybeDate = Date | "never";

export function maybedate_to_string_or(md: MaybeDate, never_representation: string) {
    if(md === "never") {
        return never_representation;
    }
    else {
        return md.toISOString().split("T")[0];
    }
}

export function get_time(md: MaybeDate): number {
    if(md === "never") {
        return Number.POSITIVE_INFINITY;
    }
    else {
        return md.getTime();
    }
}

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
