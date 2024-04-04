import {TaskGraph} from "./taskgraph";
import { show_agenda, show_all_tasks, show_all_tasks_by_progress, show_task_details } from "./gui";
import { Task, isProgress } from "./task";


type Page = "main" | "task-details";
type PageState = {page: Page, task_id?: number};

const content = document.getElementById("content");
const main_selector = document.getElementById("main-selector") as HTMLSelectElement;
const back_button = document.getElementById("back-button");
const floating_button = document.getElementById("floating-button");

const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",  deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",    deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store", deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",              priority: 0, dependencies: []},
                          {id: 5, name: "fix the car",      deadline: "never",               priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books", deadline: new Date("2023-04-1"), priority: 0, dependencies: [5]}]);

function show_create_new_task(): [string, number] {
    const new_id = tg.smallest_available_id;
    const new_task = new Task(new_id, "");
    return [show_task_details(new_task, ["todo", "doing"]), new_id];
}

function show_back_button() {
    main_selector.classList.add("not-shown");
    back_button.classList.remove("not-shown");
}

function show_main_selector() {
    main_selector.classList.remove("not-shown");
    back_button.classList.add("not-shown");
}

function add_task_id_links() {
    const dep_buttons = Array.from(document.getElementsByClassName("dependency-list-item"));
    for(const dep_button of dep_buttons) {
        dep_button.addEventListener("click", (_) => {
            const parent = dep_button.parentNode as HTMLElement;
            const task_id = parseInt(parent.dataset["taskId"]);
            const task = tg.get_task_by_id(task_id);
            content.innerHTML = show_task_details(task, ["todo", "doing", "done", "failed"]);
            add_task_id_links();
            window.history.pushState({page: "task-details", task_id: task_id}, "");
        });
    }
}

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
            content.innerHTML = show_task_details(task, ["todo", "doing", "done", "failed"]);
            show_back_button();
            add_task_id_links();
            floating_button.innerHTML = "&#10003;";
            window.history.pushState({page: "task-details", task_id: task_id}, "");
        });
    }
    
    const main_list = document.getElementById("main-list");
    main_list.scrollTop = main_list.scrollHeight;
    window.history.pushState({page: "main"}, "");
}

floating_button.addEventListener("click", (_) => {
    if(floating_button.innerHTML === "+") {
        const [cnt, new_task_id] = show_create_new_task();
        content.innerHTML = cnt;
        show_back_button();
        floating_button.innerHTML = "&#10003;";
        window.history.pushState({page: "task-details", task_id: new_task_id}, "");
    }
});
main_selector.addEventListener("change", show_gui);
back_button.addEventListener("click", (_) => window.history.back());
window.addEventListener("popstate", (e) => {
    const state = e.state as PageState;
    if(state.page === "main") {
        floating_button.innerHTML = "+";
        show_gui();
        show_main_selector();
    }
    else if(state.page === "task-details") {
        floating_button.innerHTML = "&#10003;";
        content.innerHTML = show_task_details(tg.get_task_by_id(state.task_id), ["todo", "doing", "done", "failed"]);
        show_back_button();
    }
});

show_gui();
