import { MainSelectorOptionKeys } from "./components/main_selector";
import { RawTask } from "./task";
import { TaskGraph } from "./taskgraph";
import { mz } from "mehrzahl";


export interface StatusReporter {
    success: (msg: string) => void;
    error: (msg: string) => void;
}


// This is not a class on purpose!
// AppState has to work with the useState React hook,
// which uses some serialization thechnique that breaks class instances. 
export interface AppState {
    which_task_list: MainSelectorOptionKeys;
    raw_tasks: RawTask[];
    dark_mode: boolean;
    tg: TaskGraph;
}

export function init_appstate(sr: StatusReporter, storage: Storage): AppState {
    const json = storage.getItem("tasks") ?? "[]";
    const dark_mode = storage.getItem("dark-mode") === "true";
    try {
        const tg = TaskGraph.from_json(json);
        return {
            which_task_list: "agenda",
            raw_tasks: tg.all_tasks.map((t) => t.to_raw_task()),
            dark_mode: dark_mode,
            tg: tg,
        };
    }
    catch(e) {
        if(e instanceof Error) {
            sr.error(e.message);
            return {
                which_task_list: "agenda",
                raw_tasks: [],
                dark_mode: dark_mode,
                tg: new TaskGraph([]),
            };
        }
        else {
            throw e;
        }
    }
}

export function update_appstate(sr: StatusReporter, app_state: AppState, rt: RawTask, remove?: "remove"): AppState {
    const raw_tasks = [];
    let found = false;
    for(const art of app_state.raw_tasks) {
        if(art.id === rt.id) {
            if(!remove) {
                raw_tasks.push(rt);
                found = true;
            }
        }
        else {
            raw_tasks.push(art);
        }
    }
    if(!found && !remove) {
        raw_tasks.push(rt);
    }

    try {
        const tg = new TaskGraph(raw_tasks);
        return {...app_state, raw_tasks, tg};
    }
    catch(e) {
        if(e instanceof Error) {
            sr.error(e.message);
            return app_state;
        }
        else {
            throw e;
        }
    }
}

export function import_tasks(sr: StatusReporter, app_state: AppState, tasks_json: string): AppState {
    try {
        const tg = TaskGraph.from_json(tasks_json);
        const tasks = tg.all_tasks;
        const new_state = {
            which_task_list: app_state.which_task_list,
            dark_mode: app_state.dark_mode,
            raw_tasks: tasks.map((t) => t.to_raw_task()),
            tg: tg,
        };
        sr.success(mz(tasks.length)`Imported $value {task|tasks}`);
        return new_state;
    }
    catch(e) {
        if(e instanceof Error) {
            sr.error(e.message);
            return app_state;
        }
        else {
            throw e;
        }
    }
}
