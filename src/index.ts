import {TaskGraph} from "./taskgraph";
import { show_agenda, show_all_tasks, show_all_tasks_by_progress, show_task_details } from "./gui";
import { isProgress } from "./task";

const content = document.getElementById("content");
const main_selector = document.getElementById("main-selector") as HTMLSelectElement;

const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",  deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",    deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store", deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",              priority: 0, dependencies: []},
                          {id: 5, name: "fix the car",      deadline: "never",               priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books", deadline: new Date("2023-04-1"), priority: 0, dependencies: [5]}]);

function show_gui() {
    if(main_selector.value === "agenda") {
        content.innerHTML = show_agenda(tg);
    }
    else if(main_selector.value === "all") {
        content.innerHTML = show_all_tasks(tg);
    }
    else if(isProgress(main_selector.value)) {
        content.innerHTML = show_all_tasks_by_progress(tg, main_selector.value);
    }
    else {
        console.error(`Unknown selector option: ${main_selector.value}`);
    }

    const list_items = Array.from(document.getElementsByClassName("main-list-item"));
    for(const list_item of list_items) {
        list_item.addEventListener("click", (_) => {
            const task_id = parseInt((list_item as HTMLElement).dataset["taskId"]);
            const task = tg.get_task_by_id(task_id);
            content.innerHTML = show_task_details(task);
        });
    }

    content.scrollTop = content.scrollHeight;
}

main_selector.addEventListener("change", show_gui);

show_gui();
