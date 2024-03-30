import {MaybeDate, compare_dates, get_time} from "./maybedate";


type Progress  = "blocked" | "todo" | "doing" | "done" | "failed";

interface RawTask {
    id: number,
    name: string,
    description?: string,
    priority?: number,
    deadline?: MaybeDate,
    birthline?: MaybeDate,
    progress?: Progress,
    dependencies: number[],
}

export class Task {
    constructor(
        public id: number,
        public name: string,
        public description: string = "",
        public priority: number = 0,
        public effective_priority: number = 0,
        public deadline: MaybeDate = "never",
        public effective_deadline: MaybeDate = "never",
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

export class TaskGraph {
    private tasks = new Map<number, Task>();
    private indegrees = new Map<number, number>();
    // tasks that don't depend on any other tasks
    private roots = new Set<Task>();

    public get all_tasks(): Iterable<Task> {
        return this.tasks.values();
    }

    // public get agenda(): Task[] {
    //     const indegrees = new Map(this.indegrees); // shallow copy
    //     const S = Array.from(this.roots.values()); // shallow copy
    //     const L = new Array<Task>();

    //     while(S.length > 0) {
    //         const n = S.shift();
    //         L.push(n);
    //         for(const m of n.needed_by) {
    //             indegrees.set(m.id, indegrees.get(m.id) - 1);
    //             if(indegrees.get(m.id) === 0) {
    //                 S.push(m);
    //             }
    //         }
    //     }

    //     // No need for checking for circles: it has already been checked in the constructor.

    //     return L;
    // }

    constructor(raw_tasks: RawTask[]) {
        // needed for the depth-first search later
        const colors = new Map<Task, "white" | "grey" | "black">();

        // convert raw tasks to tasks, filling in missing values with defaults
        for(const rt of raw_tasks) {
            // effective priority and effective deadline are by default the same as priority and deadline
            const task = new Task(rt.id, rt.name, rt.description, rt.priority, rt.priority, rt.deadline, rt.deadline, rt.birthline, rt.progress);
            this.tasks.set(rt.id, task);
            if(rt.dependencies.length === 0) {
                roots.add(task);
            }
            colors.set(task, "white");
        }

        // connect dependent tasks
        for(const rt of raw_tasks) {
            const task = this.tasks.get(rt.id);
            for(const dep_id of rt.dependencies) {
                const dep_task = this.tasks.get(dep_id);
                if(!dep_task) {
                    throw new Error(`Reference to non-existent task (${rt.id} --> ${dep_id})`);
                }
                task.depends_on.push(dep_task);
                dep_task.needed_by.push(task);
            }
        }

        // there are no roots --> all tasks depend on at least one other task --> there is a dependency-circle
        if(this.tasks.size > 0 && roots.size === 0) {
            throw new Error("Circular dependencies");
        }

        // propagate deadlines, priorities and progress using depth-first search
        roots.forEach((root) => {
            propagate(root, colors);
        });
    }
}

function propagate(task: Task, colors: Map<Task, "white" | "grey" | "black">): {max_priority: number, min_deadline: MaybeDate} {
    const color = colors.get(task);
    if(color === "grey") {
        throw new Error("Circular dependencies");
    }

    if(task.needed_by.length === 0 || (color === "black" && task.progress !== "failed")) {
        colors.set(task, "black");
        return {max_priority: task.effective_priority, min_deadline: task.effective_deadline};
    }

    colors.set(task, "grey");
    for(const using_task of task.needed_by) {
        if(task.progress !== "done" && using_task.progress !== "failed") {
            using_task.progress = "blocked";
        }
        if(task.progress === "failed") {
            using_task.progress = "failed";
        }

        let result = propagate(using_task, colors);
        if(result.max_priority > task.effective_priority) {
            task.effective_priority = result.max_priority;
        }
        if(compare_dates(result.min_deadline, task.effective_deadline) < 0) {
            task.effective_deadline = result.min_deadline;
        }
    }

    colors.set(task, "black");
    return {max_priority: task.effective_priority, min_deadline: task.effective_deadline};
}
