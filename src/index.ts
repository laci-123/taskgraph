import { maybedate_to_string_or } from "./maybedate";
import {TaskGraph} from "./taskgraph";


const main_list = document.getElementById("main-list");

const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2024-04-03"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",  deadline: new Date("2024-04-05"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",    deadline: new Date("2024-04-01"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store", deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook", deadline: "never",              priority: 0, dependencies: []},
                          {id: 5, name: "fix the car",      deadline: "never",               priority: -1, dependencies: []},
                          {id: 6, name: "return library books", deadline: new Date("2023-03-30"), priority: 0, dependencies: [5]}]);

if (main_list)
{
    const one_day = 24 * 60 * 60 * 1000;
    const agenda = tg.agenda(new Date(), one_day);
    for(let i = 0; i < 10; ++i) {
        main_list.innerHTML += "<li class='dummy-list-item'></li>";
    }
    for(const task of agenda) {
        const effective_deadline = maybedate_to_string_or(task.effective_deadline, "-");
        const deadline = maybedate_to_string_or(task.deadline, "-");
        main_list.innerHTML += `<li>${task.name} | ${effective_deadline} (${deadline}) | ${task.effective_priority} (${task.priority})</li>`;
    }
    for(let i = 0; i < 10; ++i) {
        main_list.innerHTML += "<li class='dummy-list-item'></li>";
    }
}
