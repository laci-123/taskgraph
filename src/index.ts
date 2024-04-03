import {TaskGraph} from "./taskgraph";
import { show_agenda } from "./gui";

const main_list = document.getElementById("main-list");
const main_selector = document.getElementById("main-selector") as HTMLSelectElement;

const tg = new TaskGraph([{id: 0, name: "cook lunch",     deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",  deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",    deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store", deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",              priority: 0, dependencies: []},
                          {id: 5, name: "fix the car",      deadline: "never",               priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books", deadline: new Date("2023-04-1"), priority: 0, dependencies: [5]}]);

main_selector.addEventListener("change", (_) => {
    if(main_selector.value === "agenda") {
        main_list.innerHTML = show_agenda(tg);
    }
    else {
        main_list.innerHTML = "<li>Nothing to show here.</li>";
    }

    switch(main_selector.value) {
        case "agenda":
            main_list.innerHTML = show_agenda(tg);
            break;
        default:
            console.error(`Unknown selector option: ${main_selector.value}`);
            
    }
});

main_list.innerHTML = show_agenda(tg);
