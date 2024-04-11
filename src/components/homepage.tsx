import { ReactElement } from "react";
import { Task } from "../task";
import { TaskGraph } from "../taskgraph";
import MainSelector, { MainSelectorOptionKeys } from "./main_selector";
import TaskList from "./tasklist";
import { useNavigate } from "react-router-dom";


function task_list(tg: TaskGraph, k: MainSelectorOptionKeys): Task[] {
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

interface HomePageProps {
    tg: TaskGraph;
    which_task_list: MainSelectorOptionKeys;
    handleChange: (e: MainSelectorOptionKeys) => void;
}

export default function HomePage(props: HomePageProps): ReactElement {
    const navigate = useNavigate();
    
    return (
        <>
            <div className="top-controls">
                <MainSelector selected={props.which_task_list} handleChange={props.handleChange} />
                <button className="top-controls-button">⚙</button>
            </div>
            <div className="content">
                <TaskList tasks={task_list(props.tg, props.which_task_list)} handleClick={null} />
            </div>
            <div className="bottom-controls">
                <button className="floating-button circular" onClick={() => navigate(`/task/${props.tg.smallest_available_id}`)}>+</button>
            </div>
        </>
    );
}
