type MaybeDate = Date | "never";
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

class Task {
    constructor(
        public id: number,
        public name: string,
        public description: string = "",
        public priority: number = 0,
        public effective_priority: number = 0,
        public deadline: MaybeDate = "never",
        public effective_deadline: Date | "never" = "never",
        public birthline: MaybeDate = "never",
        public progress: Progress = "todo",
        public depends_on: Task[] = [],
        public blocked_by: Task[] = [])
    {}
}

class TaskGraph {
    private tasks: Map<number, Task>;

    constructor(raw_tasks: RawTask[]) {
        // tasks that aren't blocked by any other task
        const roots = new Set<Task>();
        // needed for the depth-first search later
        const colors = new Map<Task, "white" | "grey" | "black">();

        // convert raw tasks to tasks, filling in missing values with defaults
        for(const rt of raw_tasks) {
            // effective priority and effective deadline are by default the same as priority and deadline
            const task = new Task(rt.id, rt.name, rt.description, rt.priority, rt.priority, rt.deadline, rt.deadline, rt.birthline, rt.progress);
            this.tasks.set(rt.id, task);
            roots.add(task);
            colors.set(task, "white");
        }

        // connect dependent tasks
        for(const rt of raw_tasks) {
            let task = this.tasks.get(rt.id);
            for(const dep_id of rt.dependencies) {
                let dep_task = this.tasks.get(dep_id);
                task.depends_on.push(dep_task);
                dep_task.blocked_by.push(task);
                roots.delete(dep_task); // dep_task is blocked by task, so it cannot be a root
            }
        }

        // propagate deadlines and priorities using depth-first search
        roots.forEach((root) => {
            const stack = new Array<Task>();
            stack.push(root);

            while(stack.length > 0) {
                const task = stack.pop();
                const color = colors.get(task);

                if(color === "grey") {
                    throw new Error("Circular dependencies");
                }
                
                if(task.depends_on.length === 0 || color === "black") {
                    if(stack.length > 0) {
                        const prev_task = stack[stack.length - 1];
                        if(task.effective_priority > prev_task.priority) {
                            prev_task.effective_priority = task.effective_priority;
                        }
                        if(prev_task.effective_deadline === "never" ||
                           (task.effective_deadline !== "never" && task.effective_deadline < prev_task.deadline))
                        {
                            prev_task.effective_deadline = task.effective_deadline;
                        }
                    }
                    colors.set(task, "black");
                    continue;
                }

                for(const dep_task of task.depends_on) {
                    stack.push(dep_task);
                    colors.set(dep_task, "grey");
                }
            }
        });
    }
}
