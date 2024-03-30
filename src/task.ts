import {MaybeDate, compare_dates} from "./maybedate";


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

export class TaskGraph {
    private tasks: Map<number, Task>;

    public get all_tasks(): Iterable<Task> {
        return this.tasks.values();
    }

    constructor(raw_tasks: RawTask[]) {
        this.tasks = new Map();
        
        // tasks that don't depend on any other tasks
        const roots = new Set<Task>();
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
