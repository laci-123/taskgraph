import { TaskGraph } from "./taskgraph";
import { maybedate_to_string_or, compare_dates } from "./maybedate";


export function show_agenda(tg: TaskGraph): string {
    const two_days = 2 * 24 * 60 * 60 * 1000;
    const agenda = tg.agenda(new Date(), two_days);
    let result = "";

    for(let i = 0; i < 2; ++i) {
        result += "<li class='dummy-list-item'></li>";
    }
    for(let i = agenda.length - 1; i >= 0; --i) {
        const task = agenda[i];
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
