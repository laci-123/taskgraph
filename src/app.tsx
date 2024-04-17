import {HashRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/homepage";
import { ReactElement, useEffect, useState } from "react";
import { RawTask } from "./task";
import { TaskGraph } from "./taskgraph";
import TaskPage from "./components/taskpage";
import { MainSelectorOptionKeys } from "./components/main_selector";
import SelectorPage from "./components/selectorpage";
import PageLayout from "./components/page_layout";
import SettingsPage from "./components/settingspage";
import toast, { ToastOptions } from "react-hot-toast";
import { mz } from "mehrzahl";


interface AppState {
    which_task_list: MainSelectorOptionKeys;
    raw_tasks: RawTask[];
    dark_mode: boolean;
    tg: TaskGraph;
}

const toast_format: ToastOptions = {className: "toast", duration: 5000, position: "bottom-center"};

function init_appstate(): AppState {
    const json = localStorage.getItem("tasks") ?? "[]";
    const dark_mode = localStorage.getItem("dark-mode") === "true";
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
            toast.error(e.toString(), toast_format);
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

function update_appstate(app_state: AppState, rt: RawTask, remove?: "remove"): AppState {
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
            toast.error(e.toString(), toast_format);
            return app_state;
        }
        else {
            throw e;
        }
    }
}

function import_tasks(app_state: AppState, tasks_json: string): AppState {
    try {
        const tg = TaskGraph.from_json(tasks_json);
        const tasks = tg.all_tasks;
        const new_state = {
            which_task_list: app_state.which_task_list,
            dark_mode: app_state.dark_mode,
            raw_tasks: tasks.map((t) => t.to_raw_task()),
            tg: tg,
        };
        toast.success(mz(tasks.length)`Imported $value {task|tasks}`, toast_format);
        return new_state;
    }
    catch(e) {
        if(e instanceof Error) {
            toast.error(e.toString(), toast_format);
            return app_state;
        }
        else {
            throw e;
        }
    }
}

export default function App(): ReactElement {
    const [state, setState] = useState<AppState>(init_appstate());

    useEffect(() => {
        localStorage.setItem("tasks", state.tg.to_json());
    }, [state.tg]);
    useEffect(() => {
        if(state.dark_mode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("dark-mode", "true");
        }
        else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("dark-mode", "false");
        }
    }, [state.dark_mode]);

    const homepage = <HomePage tg={state.tg}
                               which_task_list={state.which_task_list}
                               handleChange={(e) => setState({...state, which_task_list: e})} />;
    const taskpage = <TaskPage tg={state.tg}
                               handleSave={(rt, remove) => setState(update_appstate(state, rt, remove))} />;
    const selectorpage = <SelectorPage tg={state.tg}
                                       handleSave={(rt) => setState(update_appstate(state, rt))} />;
    const settingspage = <SettingsPage tg={state.tg}
                                       is_dark={state.dark_mode}
                                       handleChange={(is_dark) => setState({...state, dark_mode: is_dark})}
                                       handleTaskImport={(tasks_json) => setState(import_tasks(state, tasks_json))} />

    return (
        <HashRouter>
            <Routes>
                <Route element={<PageLayout />}>
                    <Route path="/"/>
                    <Route path="/index.html" element={homepage} />
                    <Route index element={homepage} />
                    <Route path="/task/:task_param" element={taskpage} />
                    <Route path="/selector/:task_id" element={selectorpage} />
                    <Route path="/settings" element={settingspage} />
                    <Route path="*" element={homepage} />
                </Route>
            </Routes>
        </HashRouter>
    );
}
