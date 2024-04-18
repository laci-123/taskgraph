// largest and smallest dates that JavaScript can represent
// source: https://262.ecma-international.org/11.0/#sec-time-values-and-time-range
export const DATE_MAX = new Date(+8640000000000000); 
export const DATE_MIN = new Date(-8640000000000000);

export function date_to_YMD(date: Date): string {
    return date.toISOString().split("T")[0];
}

export function date_to_YMD_or(date: Date, min_representation: string, max_reperesentation: string): string {
    if(date.getTime() <= DATE_MIN.getTime()) {
        return min_representation;
    }
    if(date.getTime() >= DATE_MAX.getTime()) {
        return max_reperesentation;
    }
    return date_to_YMD(date);
}

export function days_between(d1: Date, d2: Date): number {
    return (d1.getTime() - d2.getTime()) / (24 * 60 * 60 * 1000);
}
