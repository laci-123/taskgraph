import {DATE_MIN, DATE_MAX} from "./maybedate";


export const progress_type_values = ["blocked", "todo", "started", "done", "failed"] as const;

export type Progress  = (typeof progress_type_values)[number];

export function isProgress(x: any): x is Progress {
    return progress_type_values.includes(x);
}

export interface RawTask {
    id: number,
    name: string,
    description?: string,
    priority?: number,
    deadline?: number,
    birthline?: number,
    progress?: Progress,
    dependencies?: number[],
}

export function copy_RawTask_without_defaults(rt: RawTask): RawTask {
    const {id, name, description, priority, deadline, birthline, progress, dependencies} = rt;
    const new_rt = {id, name} as RawTask;
    if(description !== "") {
        new_rt.description = description;
    }
    if(priority !== 0) {
        new_rt.priority = priority;
    }
    if(deadline && deadline < DATE_MAX.getTime()) {
        new_rt.deadline = deadline;
    }
    if(birthline && birthline > DATE_MIN.getTime()) {
        new_rt.birthline = birthline;
    }
    if(progress !== "blocked" && progress !== "todo") {
        new_rt.progress = progress;
    }
    if(dependencies && dependencies.length > 0) {
        new_rt.dependencies = dependencies;
    }

    return new_rt;
}

export function asRawTask(x: any): RawTask {
    if("id" in x && typeof(x.id) === "number" && "name" in x && typeof(x.name) == "string") {
        if("deadline" in x && typeof(x.deadline) === "string") {
            x.deadline = new Date(x.deadline);
        }
        if("birthline" in x && typeof(x.birthline) === "string") {
            x.birthline = new Date(x.birthline);
        }
        return x;
    }
    else {
        throw new Error(`cannot convert '${x}' to RawTask`);
    }
}

export function asRawTaskArray(xs: any): RawTask[] {
    if(Array.isArray(xs)) {
        return xs.map((x) => asRawTask(x));
    }
    else {
        throw new Error(`cannot convert '${xs}' to RawTask`);
    }
}

export class Task {
    constructor(
        public id: number,
        public name: string,
        public description: string = "",
        public priority: number = 0,
        public deadline: Date = new Date(DATE_MAX),
        public effective_priority: number = priority,
        public effective_deadline: Date = deadline,
        public birthline: Date = new Date(DATE_MIN),
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
        if(this.deadline <= DATE_MAX) {
            rt.deadline = this.deadline.getTime();
        }
        if(this.birthline >= DATE_MIN) {
            rt.birthline = this.birthline.getTime();
        }
        if(this.progress !== "todo") {
            rt.progress = this.progress;
        }
        if(this.depends_on.length > 0) {
            rt.dependencies = this.depends_on.map((t) => t.id);
        }

        return rt;
    }

    public has_unfinished_dependency(): boolean {
        for(const dep_task of this.depends_on) {
            if(dep_task.progress === "blocked" || dep_task.progress === "todo" || dep_task.progress === "started") {
                return true;
            }
        }

        return false;
    }

    public has_failed_dependency(): boolean {
        for(const dep_task of this.depends_on) {
            if(dep_task.progress === "failed") {
                return true;
            }
        }

        return false;
    }
}

function compare_tasks_regardless_of_deadline(a: Task, b: Task): number {
    if(a.effective_priority > b.effective_priority) {
        return -1;
    }
    else if(a.effective_priority < b.effective_priority) {
        return +1;
    }
    else if(a.effective_deadline < b.effective_deadline) {
        return -1;
    }
    else if(a.effective_deadline > b.effective_deadline) {
        return +1;
    }
    else {
        return 0;
    }
}

export function compare_tasks(now: Date, close_to_deadline: number): (a: Task, b: Task) => number {
    return (a, b) => {
        const a_is_due = a.effective_deadline.getTime() - now.getTime() < close_to_deadline;
        const b_is_due = b.effective_deadline.getTime() - now.getTime() < close_to_deadline;
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
