import { ReactElement, useState } from "react";
import { Task } from "./task";
import { TaskGraph } from "./taskgraph";
import FloatingButton from "./components/floating_button";
import MainSelector, { MainSelectorOptionKeys } from "./components/main_selector";
import SettingsButton from "./components/settings_button";
import TaskList from "./components/tasklist";


const tg = new TaskGraph([{id: 0, name: "cook lunch",                                                       deadline: new Date("2024-04-13"), priority: 5,  dependencies: [1, 4]},
                          {id: 1, name: "buy some food",                                                    deadline: new Date("2024-04-15"), priority: 0,  dependencies: [3]},
                          {id: 2, name: "walk the dog",                                                     deadline: new Date("2024-04-04"), priority: 10, dependencies: []},
                          {id: 3, name: "go to the store",                                                  deadline: "never",                priority: 0,  dependencies: [5]},
                          {id: 4, name: "learn how to cook [The quick brown fox jumps over the lazy dog.]", deadline: "never",                priority: 0,  dependencies: []},
                          {id: 5, name: "fix the car",                                                      deadline: "never",                priority: -1, dependencies: [], progress: "doing"},
                          {id: 6, name: "return library books",                                             deadline: new Date("2023-04-1"),  priority: 0,  dependencies: [5]}]);

function task_list(k: MainSelectorOptionKeys): Task[] {
    if(k === "agenda") {
        const two_days = 2 * 24 * 60 * 60 * 1000;
        return tg.agenda(new Date(), two_days);
    }
    else if(k === "all") {
        return tg.all_tasks;
    }
    else {
        return tg.all_tasks_by_progress(k);
    }
}

interface AppState {
    which_task_list: MainSelectorOptionKeys;
}

export default function App(): ReactElement {
    const [state, setState] = useState<AppState>({which_task_list: "agenda"});
    
    return (
        <>
            <div className="top-controls">
                <MainSelector selected={state.which_task_list} handleChange={(e) => setState({which_task_list: e})} />
                <SettingsButton />
            </div>
            <div className="content">
            <TaskList tasks={task_list(state.which_task_list)}/>
            </div>
            <div className="bottom-controls">
                <FloatingButton role="add-task" onClick={() => {}} />
            </div>
        </>
    );
}
