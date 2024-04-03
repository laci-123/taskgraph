import { compare_dates, maybedate_to_string_or } from "./maybedate";
import {TaskGraph} from "./taskgraph";


const main_list = document.getElementById("main-list");

const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",  deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",    deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store", deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",              priority: 0, dependencies: []},
                          {id: 5, name: "fix the car",      deadline: "never",               priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books", deadline: new Date("2023-04-1"), priority: 0, dependencies: [5]}]);

if (main_list)
{
    const two_days = 2 * 24 * 60 * 60 * 1000;
    const agenda = tg.agenda(new Date(), two_days);

    for(let i = 0; i < 2; ++i) {
        main_list.innerHTML += "<li class='dummy-list-item'></li>";
    }
    for(let i = agenda.length - 1; i >= 0; --i) {
        const task = agenda[i];
        const effective_deadline = maybedate_to_string_or(task.effective_deadline, "-");
        const overdue_deadline_style = compare_dates(task.effective_deadline, new Date()) < 0 ? "task-deadline-overdue" : "";
        let item = "<li class='main-list-item'>";
        item += `<div class='task-progress'>${task.progress.toString().toUpperCase()}</div>`;
        item += `<div class='task-name'>${task.name}</div>`;
        item += `<div class='task-deadline ${overdue_deadline_style}'>${effective_deadline}</div>`;
        item += `<div class='task-priority'>priority: ${task.priority}</div>`;
        item += "</li>";
        main_list.innerHTML += item;
    }
    for(let i = 0; i < 3; ++i) {
        main_list.innerHTML += "<li class='dummy-list-item'></li>";
    }
}
