import {HashRouter, Route, Routes} from "react-router-dom";
import HomePage from "./components/homepage";
import { ReactElement, useEffect, useState } from "react";
import TaskPage from "./components/taskpage";
import SelectorPage from "./components/selectorpage";
import PageLayout from "./components/page_layout";
import SettingsPage from "./components/settingspage";
import { AppState, init_appstate, update_appstate, import_tasks } from "./app_state";


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
