import { Progress, RawTask, asRawTaskArray } from "./task";
import { TaskGraph } from "./taskgraph";


export class TaskManager {
    private raw_tasks: Map<number, RawTask>;
    private tg: TaskGraph;

    constructor(json: string) {
        const raw_task_array = asRawTaskArray(JSON.parse(json));
        this.raw_tasks = new Map(raw_task_array.map((rt) => [rt.id, rt]));
        this.tg = new TaskGraph(raw_task_array);
    }

    public to_json(pretty_print?: "pretty-print"): string {
        return this.tg.to_json(pretty_print);
    }

    public add(name: string): number {
        const id = this.tg.smallest_available_id;
        const rt: RawTask = {id, name};
        this.raw_tasks.set(id, rt);
        this.update();
        return id;
    }

    public remove(id: number) {
        if(!this.raw_tasks.delete(id)) {
            this.error_bad_id(id);
        }
        this.update();
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

    public set_name(id: number, name: string) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.name = name;
        this.update();
    }

    public get_description(id: number): string | undefined {
        return this.tg.get_task_by_id(id)?.description;
    }

    public set_description(id: number, description: string) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.description = description;
        this.update();
    }

    public get_priority(id: number): number | undefined {
        return this.tg.get_task_by_id(id)?.priority;
    }

    public set_priority(id: number, priority: number) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.priority = priority;
        this.update();
    }

    public get_effective_priority(id: number): number | undefined {
        return this.tg.get_task_by_id(id)?.effective_priority;
    }

    public get_deadline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.deadline;
    }

    public set_deadline(id: number, deadline: Date) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.deadline = deadline.getTime();
        this.update();
    }

    public get_effective_deadline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.effective_deadline;
    }

    public get_birthline(id: number): Date | undefined {
        return this.tg.get_task_by_id(id)?.birthline;
    }

    public set_birthline(id: number, birthline: Date) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.birthline = birthline.getTime();
        this.update();
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
        this.update();
    }

    public get_users(id: number): number[] | undefined {
        return this.tg.get_task_by_id(id)?.needed_by.map((t) => t.id);
    }

    public get_repeat(id: number): number | null | undefined {
        return this.tg.get_task_by_id(id)?.repeat;
    }

    public set_repeat(id: number, repeat: number) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.repeat = repeat;
        this.update();
    }

    public get_next(id: number): number | null | undefined {
        return this.tg.get_task_by_id(id)?.next;
    }

    public set_next(id: number, next: number) {
        const rt = this.raw_tasks.get(id) ?? this.error_bad_id(id);
        rt.next = next;
        this.update();
    }

    private update() {
        this.tg = new TaskGraph(Array.from(this.raw_tasks.values()));
    }

    private error_bad_id(id: number): never {
        throw new Error(`there is no task with ID ${id}`);
    }
}
