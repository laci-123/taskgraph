import {HashRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/homepage";
import { ReactElement, useState } from "react";
import { RawTask } from "./task";
import { TaskGraph } from "./taskgraph";
import TaskPage from "./components/taskpage";
import { MainSelectorOptionKeys } from "./components/main_selector";
import SelectorPage from "./components/selectorpage";


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
    raw_tasks: Map<number, RawTask>;
    tg: TaskGraph;
    selected_task: number | null;
}

function update_appstate(raw_tasks: Map<number, RawTask> | "load-tasks", task_list: MainSelectorOptionKeys, rt?: RawTask): AppState {
    if(raw_tasks === "load-tasks") {
        raw_tasks = new Map(raw_tasks_c.map((rt) => [rt.id, rt as RawTask]));
    }
    if(rt) {
        raw_tasks.set(rt.id, rt);
    }
    return {which_task_list: task_list,
            raw_tasks: raw_tasks,
            tg: new TaskGraph(Array.from(raw_tasks.values())),
            selected_task: null};
}

export default function App(): ReactElement {
    const [state, setState] = useState<AppState>(update_appstate("load-tasks", "agenda"));

    const homepage = <HomePage tg={state.tg}
                               which_task_list={state.which_task_list}
                               handleChange={(e) => setState({...state, which_task_list: e})} />;
    const taskpage = <TaskPage tg={state.tg}
                               selected_task={state.selected_task}
                               handleSave={(rt) => setState(update_appstate(state.raw_tasks, state.which_task_list, rt))} />;
    const selectorpage = <SelectorPage tg={state.tg} handleSelect={(id) => setState({...state, selected_task: id})} />;

    return (
        <HashRouter>
            <Routes>
                <Route path="/"/>
                <Route path="/index.html" element={homepage} />
                <Route index element={homepage} />
                <Route path="/task/:task_id" element={taskpage} />
                <Route path="/selector" element={selectorpage} />
                <Route path="*" element={homepage} />
            </Routes>
        </HashRouter>
    );
}
