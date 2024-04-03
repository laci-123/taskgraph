import { Progress, Task, compare_tasks } from "./task";
import { TaskGraph } from "./taskgraph";
import { maybedate_to_string_or, compare_dates } from "./maybedate";


export function show_agenda(tg: TaskGraph): string {
    const two_days = 2 * 24 * 60 * 60 * 1000;
    const agenda = tg.agenda(new Date(), two_days);
    return show_list(agenda);
}

export function show_all_tasks(tg: TaskGraph): string {
    const tasks = tg.all_tasks;
    tasks.sort(compare_tasks(new Date(), 2 * 24 * 60 * 60 * 1000));
    return show_list(tasks);
}

export function show_all_tasks_by_progress(tg: TaskGraph, progress: Progress): string {
    const tasks = tg.all_tasks_by_progress(progress);
    tasks.sort(compare_tasks(new Date(), 2 * 24 * 60 * 60 * 1000));
    return show_list(tasks);
}

function show_list(tasks: Task[]): string {
    let result = "";

    for(let i = 0; i < 2; ++i) {
        result += "<li class='dummy-list-item'></li>";
    }
    for(let i = tasks.length - 1; i >= 0; --i) {
        const task = tasks[i];
        const effective_deadline = maybedate_to_string_or(task.effective_deadline, "-");
        const overdue_deadline_style = compare_dates(task.effective_deadline, new Date()) < 0 ? "task-deadline-overdue" : "";
        result += "<li class='main-list-item'>";
        result += `<div class='task-progress'>${task.progress.toString().toUpperCase()}</div>`;
        result += `<div class='task-name'>${task.name}</div>`;
        result += `<div class='task-deadline ${overdue_deadline_style}'>${effective_deadline}</div>`;
        result += `<div class='task-priority'>priority: ${task.priority}</div>`;
        result += "</li>";
    }
    for(let i = 0; i < 3; ++i) {
        result  += "<li class='dummy-list-item'></li>";
    }

    return result;
}
