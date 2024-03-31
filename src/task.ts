import {MaybeDate, compare_dates, get_time} from "./maybedate";


type Progress  = "blocked" | "todo" | "doing" | "done" | "failed";

export interface RawTask {
    id: number,
    name: string,
    description?: string,
    priority?: number,
    deadline?: MaybeDate,
    birthline?: MaybeDate,
    progress?: Progress,
    dependencies?: number[],
}

export class Task {
    constructor(
        public id: number,
        public name: string,
        public description: string = "",
        public priority: number = 0,
        public deadline: MaybeDate = "never",
        public effective_priority: number = priority,
        public effective_deadline: MaybeDate = deadline,
        public birthline: MaybeDate = "never",
        public progress: Progress = "todo",
        public depends_on: Task[] = [],
        public needed_by: Task[] = [])
    {}
}

function compare_tasks_regardless_of_deadline(a: Task, b: Task): number {
    if(a.effective_priority > b.effective_priority) {
        return -1;
    }
    else if(a.effective_priority < b.effective_priority) {
        return +1;
    }
    else {
        return compare_dates(a.effective_deadline, b.effective_deadline);
    }
}

export function compare_tasks(now: Date, close_to_deadline: number): (a: Task, b: Task) => number {
    return (a, b) => {
        const a_is_due = get_time(a.effective_deadline) - now.getTime() < close_to_deadline;
        const b_is_due = get_time(b.effective_deadline) - now.getTime() < close_to_deadline;
        if(a_is_due) {
            if(b_is_due) {
                return compare_tasks_regardless_of_deadline(a, b);
            }
            else {
                return -1;
            }
        }
        else {
            if(b_is_due) {
                return +1;
            }
            else {
                return compare_tasks_regardless_of_deadline(a, b);
            }
        }
    };
}
