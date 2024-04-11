import {HashRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/homepage";
import { ReactElement, useState } from "react";
import { RawTask } from "./task";
import { TaskGraph } from "./taskgraph";
import TaskPage from "./components/taskpage";
import { MainSelectorOptionKeys } from "./components/main_selector";
import SelectorPage from "./components/selectorpage";
import ErrorPage from "./components/errorpage";


// This is going to be loaded from local storage.
const raw_tasks_c = [{id: 0, name: "cook lunch",                                                       deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                     {id: 1, name: "buy some food",                                                    deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                     {id: 2, name: "walk the dog",                                                     deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                     {id: 3, name: "go to the store",                                                  deadline: "never",                priority: 0,  dependencies: [5]},
                     {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",                priority: 0,  dependencies: []},
                     {id: 5, name: "fix the car",                                                      deadline: "never",                priority: -1, dependencies: [], progress: "doing"},
                     {id: 6, name: "return library books",                                             deadline: new Date("2023-04-1"),  priority: 0,  dependencies: [5]}];

interface AppState {
    which_task_list: MainSelectorOptionKeys;
    raw_tasks: RawTask[];
    tg: TaskGraph;
    error: Error | null;
}

function init_appstate(): AppState {
    try {
        const tg = new TaskGraph(raw_tasks_c as RawTask[]);
        return {
            which_task_list: "agenda",
            raw_tasks: raw_tasks_c as RawTask[],
            tg: tg,
            error: null
        };
    }
    catch(e) {
        if(e instanceof Error) {
            return {
                which_task_list: "agenda",
                raw_tasks: raw_tasks_c as RawTask[],
                tg: new TaskGraph([]),
                error: e
            };
        }
        else {
            throw e;
        }
    }
}

function update_appstate(app_state: AppState, rt: RawTask): AppState {
    const raw_tasks = [];
    let pushed = false;
    for(const art of app_state.raw_tasks) {
        if(art.id === rt.id) {
            raw_tasks.push(rt);
            pushed = true;
        }
        else {
            raw_tasks.push(art);
        }
    }
    if(!pushed) {
        raw_tasks.push(rt);
    }

    try {
        const tg = new TaskGraph(raw_tasks);
        return {
            which_task_list: app_state.which_task_list,
            raw_tasks: raw_tasks,
            tg: tg,
            error: null
        };
    }
    catch(e) {
        if(e instanceof Error) {
            return {
                which_task_list: app_state.which_task_list,
                raw_tasks: app_state.raw_tasks,
                tg: app_state.tg,
                error: e,
            };
        }
        else {
            throw e;
        }
    }
}

export default function App(): ReactElement {
    const [state, setState] = useState<AppState>(init_appstate());

    const homepage = <HomePage tg={state.tg}
                               which_task_list={state.which_task_list}
                               handleChange={(e) => setState({...state, which_task_list: e})} />;
    const taskpage = <TaskPage tg={state.tg}
                               handleSave={(rt) => setState(update_appstate(state, rt))} />;
    const selectorpage = <SelectorPage tg={state.tg}
                                       handleSave={(rt) => setState(update_appstate(state, rt))} />;

    return (
        <HashRouter>
            <Routes>
                <Route element={<ErrorPage error={state.error} resetError={() => setState({...state, error: null})} />}>
                    <Route path="/"/>
                    <Route path="/index.html" element={homepage} />
                    <Route index element={homepage} />
                    <Route path="/task/:task_param" element={taskpage} />
                    <Route path="/selector/:task_id" element={selectorpage} />
                    <Route path="*" element={homepage} />
                </Route>
            </Routes>
        </HashRouter>
    );
}
