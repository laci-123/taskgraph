import { ReactElement } from "react";
import FloatingButton from "./components/floating_button";
import MainSelector from "./components/main_selector";
import SettingsButton from "./components/settings_button";
import TaskList from "./components/tasklist";


export default function App(): ReactElement {
    return (
        <>
            <div className="top-controls">
                <MainSelector selected="agenda" />
                <SettingsButton />
            </div>
            <div className="content">
                <TaskList />
            </div>
            <div className="bottom-controls">
                <FloatingButton role="add-task" onClick={() => {}} />
            </div>
        </>
    );
}
