import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/homepage";
import { ReactElement, useState } from "react";
import { TaskGraph } from "./taskgraph";
import TaskPage from "./components/taskpage";
import { MainSelectorOptionKeys } from "./components/main_selector";


const tg = new TaskGraph([{id: 0, name: "cook lunch",                                                       deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",                                                    deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",                                                     deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store",                                                  deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",                priority: 0,  dependencies: []},
                          {id: 5, name: "fix the car",                                                      deadline: "never",                priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books",                                             deadline: new Date("2023-04-1"),  priority: 0,  dependencies: [5]}]);

interface AppState {
    which_task_list: MainSelectorOptionKeys;
}

export default function App(): ReactElement {
    const [state, setState] = useState<AppState>({which_task_list: "agenda"});

    const homepage = <HomePage tg={tg}
                               which_task_list={state.which_task_list}
                               handleChange={(e) => setState({...state, which_task_list: e})} />;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"/>
                <Route path="/index.html" element={homepage} />
                <Route index element={homepage} />
                <Route path="/task/:task_id" element={<TaskPage tg={tg} />} />
                <Route path="*" element={homepage} />
            </Routes>
        </BrowserRouter>
    );
}
