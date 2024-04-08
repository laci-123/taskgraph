import {MaybeDate, compare_dates, get_time} from "./maybedate";


export const progress_type_values = ["blocked", "todo", "doing", "done", "failed"] as const;

export type Progress  = (typeof progress_type_values)[number];

export function isProgress(x: any): x is Progress {
    return progress_type_values.includes(x);
}

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

    public to_raw_task(): RawTask {
        const rt = {id: this.id, name: this.name} as RawTask;
        if(this.description !== "") {
            rt.description = this.description;
        }
        if(this.priority !== 0) {
            rt.priority = this.priority;
        }
        if(this.deadline !== "never") {
            rt.deadline = this.deadline;
        }
        if(this.birthline !== "never") {
            rt.birthline = this.birthline;
        }
        if(this.progress !== "todo") {
            rt.progress = this.progress;
        }
        if(this.depends_on.length > 0) {
            rt.dependencies = this.depends_on.map((t) => t.id);
        }

        return rt;
    }
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
