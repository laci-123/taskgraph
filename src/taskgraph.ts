import {MaybeDate, compare_dates} from "./maybedate";
import {Task, RawTask, compare_tasks, Progress} from "./task";
import PriorityQueue from "priority-queue-typescript";


export class TaskGraph {
    private tasks = new Map<number, Task>();
    // how many other tasks depend on a given task
    private indegrees = new Map<number, number>();
    // tasks that don't depend on any other tasks
    private roots = new Set<Task>();

    public get all_tasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    public all_tasks_by_progress(progress: Progress): Task[] {
        const tasks = Array.from(this.tasks.values());
        return tasks.filter((task) => task.progress === progress);
    }

    public agenda(now: Date, close_to_deadline: number): Task[] {
        // Topoligical sort using an adapted version of Kahn's algorithm (https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm).
        // The main difference is that instead of keeping the nodes in a set,
        // we use a priority queue sorted by the tasks priority and deadline.
        // This way independent tasks will be sorted correctly. 

        const indegrees = new Map(this.indegrees);         // shallow copy
        const roots     = Array.from(this.roots.values()); // shallow copy
        const S = new PriorityQueue<Task>(roots.length > 0 ? roots.length : 1, compare_tasks(now, close_to_deadline));
        for(const root of roots) {
            S.add(root);
        }
        const L = new Array<Task>();

        while(S.size() > 0) {
            const n = S.poll();
            if(n.progress === "todo" || n.progress === "doing") {
                L.push(n);
            }
            for(const m of n.needed_by) {
                indegrees.set(m.id, indegrees.get(m.id) - 1);
                if(indegrees.get(m.id) === 0) {
                    S.add(m);
                }
            }
        }

        // No need for checking for circles: it has already been checked in the constructor.

        return L;
    }

    constructor(raw_tasks: RawTask[]) {
        // needed for the depth-first search later
        const colors = new Map<Task, "white" | "grey" | "black">();

        // convert raw tasks to tasks, filling in missing values with defaults
        for(const rt of raw_tasks) {
            // effective priority and effective deadline are by default the same as priority and deadline
            const task = new Task(rt.id, rt.name, rt.description, rt.priority, rt.deadline, rt.priority, rt.deadline, rt.birthline, rt.progress);
            this.tasks.set(rt.id, task);
            if(rt.dependencies.length === 0) {
                this.roots.add(task);
            }
            colors.set(task, "white");
            this.indegrees.set(rt.id, 0);
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
                const indegree = this.indegrees.get(rt.id);
                this.indegrees.set(rt.id, indegree + 1);
            }
        }

        // there are no roots --> all tasks depend on at least one other task --> there is a dependency-circle
        if(this.tasks.size > 0 && this.roots.size === 0) {
            throw new Error("Circular dependencies");
        }

        // propagate deadlines, priorities and progress using depth-first search
        this.roots.forEach((root) => {
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
