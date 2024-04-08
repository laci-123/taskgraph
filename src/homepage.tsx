import { ReactElement, useState } from "react";
import { Task } from "./task";
import { TaskGraph } from "./taskgraph";
import FloatingButton from "./components/floating_button";
import MainSelector, { MainSelectorOptionKeys } from "./components/main_selector";
import TopControlsButton from "./components/topcontrols_button";
import TaskList from "./components/tasklist";
import TaskDetails from "./components/task_details";


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

type AppState = {
    page: "main";
    which_task_list: MainSelectorOptionKeys;
} | {
    page: "task-details";
    task_id: number;
};

export default function HomePage(): ReactElement {
    const [state, setState] = useState<AppState>({page: "main", which_task_list: "agenda"});
    
    return (
        <>
            <div className="top-controls">
                {
                    state.page === "main"
                    ?
                    <MainSelector selected={state.which_task_list} handleChange={(e) => setState({page: "main", which_task_list: e})} />
                    :
                    <TopControlsButton text="⚙"/>
                }
            </div>
            <div className="content">
            {
                state.page === "main"
                ?
                <TaskList tasks={task_list(state.which_task_list)} handleTaskClick={(id) => setState({page: "task-details", task_id: id})} />
                :
                <TaskDetails task={tg.get_task_by_id(state.task_id)!} enabled_progresses={["todo", "doing", "done", "failed"]}/>
            }
            </div>
            <div className="bottom-controls">
                <FloatingButton role="add-task" onClick={() => {}} />
            </div>
        </>
    );
}
