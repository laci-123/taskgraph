import { Progress, RawTask, asRawTaskArray } from "./task";
import { TaskGraph } from "./taskgraph";


export class TaskManager {
    private raw_tasks: Map<number, RawTask>;
    private tg: TaskGraph;

    private constructor(raw_tasks: Map<number, RawTask>, tg: TaskGraph) {
        this.raw_tasks = raw_tasks;
        this.tg = tg;
    }

    public from_json(json: string): TaskManager {
        const raw_task_array = asRawTaskArray(JSON.parse(json));
        const raw_tasks = new Map(raw_task_array.map((rt) => [rt.id, rt]));
        const tg = new TaskGraph(raw_task_array);
        return new TaskManager(raw_tasks, tg);
    }

    private update(): TaskManager {
        const tg = new TaskGraph(Array.from(this.raw_tasks.values()));
        return new TaskManager(this.raw_tasks, tg);
    }

    public to_json(pretty_print?: "pretty-print"): string {
        return this.tg.to_json(pretty_print);
    }

    public add(name: string): {new_id: number, new_tm: TaskManager} {
        const id = this.tg.smallest_available_id;
        const rt: RawTask = {id, name};
        this.raw_tasks.set(id, rt);
        return {new_id: id, new_tm: this.update()};
    }

    public remove(id: number): TaskManager {
        if(!this.raw_tasks.delete(id)) {
            this.error_bad_id(id);
        }
        return this.update();
    }

    public agenda(now: Date, close_to_deadline: number): number[] {
        return this.tg.agenda(now, close_to_deadline).map((t) => t.id);
    }

    public all_tasks(): number[] {
        return this.tg.all_tasks.map((t) => t.id);
    }

    public all_tasks_by_progress(progress: Progress): number[] {
        return this.tg.all_tasks_by_progress(progress).map((t) => t.id);
    }

    public get_name(id: number): string | undefined {
        return this.tg.get_task_by_id(id)?.name;
    }

    public set_name(id: number, name: string): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.name = name;
        return this.update();
    }

    public get_description(id: number): string | undefined {
        return this.tg.get_task_by_id(id)?.description;
    }

    public set_description(id: number, description: string): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.description = description;
        return this.update();
    }

    public get_priority(id: number): number | undefined {
        return this.tg.get_task_by_id(id)?.priority;
    }

    public set_priority(id: number, priority: number): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.priority = priority;
        return this.update();
    }

    public get_effective_priority(id: number): number | undefined {
        return this.tg.get_task_by_id(id)?.effective_priority;
    }

    public get_deadline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.deadline;
    }

    public set_deadline(id: number, deadline: Date): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.deadline = deadline.getTime();
        return this.update();
    }

    public get_effective_deadline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.effective_deadline;
    }

    public get_birthline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.birthline;
    }

    public set_birthline(id: number, birthline: Date): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.birthline = birthline.getTime();
        return this.update();
    }

    public get_dependencies(id: number): number[] | undefined {
        return this.tg.get_task_by_id(id)?.depends_on.map((t) => t.id);
    }

    public add_dependency(id: number, dep_id: number) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        if(!rt.dependencies) {
            rt.dependencies = [];
        }
        rt.dependencies.push(dep_id);
        return this.update();
    }

    public get_users(id: number): number[] | undefined {
        return this.tg.get_task_by_id(id)?.needed_by.map((t) => t.id);
    }

    public get_repeat(id: number): number | null | undefined {
        return this.tg.get_task_by_id(id)?.repeat;
    }

    public set_repeat(id: number, repeat: number): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.repeat = repeat;
        return this.update();
    }

    public get_next(id: number): number | null | undefined {
        return this.tg.get_task_by_id(id)?.next;
    }

    public set_next(id: number, next: number): TaskManager {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.next = next;
        return this.update();
    }

    private error_bad_id(id: number): never {
        throw new Error(`there is no task with ID ${id}`);
    }
}
