import { Progress, Task, compare_tasks, progress_type_values } from "./task";
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

export function show_task_details(task: Task, enabled_progresses: Progress[]): string {
    let result = "";

    result += "<div id='task-details'>";

    // name
    result += `<input type='text' id='task-name-input' value='${task.name}' placeholder='Task name'></input>`;

    // progress
    result += "<div id='task-progress-group'>";
    result += `<label for='task-progress-input' id='task-progress-label'>Progress:</label>`;
    if(task.progress === "blocked") {
        result += "<div id='task-progress-input-disabled'>BLOCKED</div>";
    }
    else {
        const progress_options = progress_type_values.map((v) => 
            enabled_progresses.includes(v) ?
                `<option value='${v}' ${v === task.progress ? "selected='selected'" : ""}>${v.toUpperCase()}</option>` :
                ""
        ).join("");
        result += `<select id='task-progress-input'>${progress_options}</select>`;
    }
    result += "</div>";

    // description
    result += "<div id='task-description-group'>";
    result += `<label for='task-description-input' id='task-description-label'>Description:</label>`;
    result += `<textarea id='task-description-input' cols='100' rows='3'>${task.description}</textarea>`;
    result += "</div>";

    // deadline
    result += "<div>";
    if(task.deadline === "never") {
        result += `<div><input type='checkbox' id='task-has-deadline-input'></input><label for='task-has-deadline-input'>Deadline</label></div>`;
    }
    else {
        result += `<div><input type='checkbox' id='task-has-deadline-input' value='Deadline' checked></input><label for='task-has-deadline-input'>Deadline</label></div>`;
        result += `<input type='date' id='task-deadline-input' value='${task.deadline.toISOString().split("T")[0]}'></input>`;
    }
    if(task.effective_deadline !== task.deadline && task.effective_deadline !== "never") {
        result += `<div id='task-effective-deadline-label'>Computed: ${task.effective_deadline.toISOString().split("T")[0]}</div>`;
    }
    result += "</div>";

    // priority
    result += "<div>";
    result += `<div id='task-priority-label'>Priority:</div>`;
    result += `<input type='number' id='task-priority-input' value='${task.priority}' min='-100' max='100'></input>`;
    result += "</div>";

    result += "</div>";

    return result;
}

function show_list(tasks: Task[]): string {
    let result = "<ul id='main-list'>";

    for(let i = 0; i < 2; ++i) {
        result += "<li class='dummy-list-item'></li>";
    }
    for(let i = tasks.length - 1; i >= 0; --i) {
        const task = tasks[i];
        const effective_deadline = maybedate_to_string_or(task.effective_deadline, "-");
        const overdue_deadline_style = compare_dates(task.effective_deadline, new Date()) < 0 ? "task-deadline-overdue" : "";
        result += `<li class='main-list-item' data-task-id='${task.id}'>`;
        result += `<div class='task-progress'>${task.progress.toString().toUpperCase()}</div>`;
        result += `<div class='task-name'>${task.name}</div>`;
        result += `<div class='task-deadline ${overdue_deadline_style}'>${effective_deadline}</div>`;
        result += `<div class='task-priority'>priority: ${task.priority}</div>`;
        result += `</li>`;
    }
    for(let i = 0; i < 3; ++i) {
        result  += "<li class='dummy-list-item'></li>";
    }
    result += "</ul>";

    return result;
}
