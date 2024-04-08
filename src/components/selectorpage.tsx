import { ReactElement } from "react";
import TaskList from "./tasklist";
import { TaskGraph } from "../taskgraph";
import { useNavigate } from "react-router-dom";


interface SelectorPageProps {
    tg: TaskGraph;
    handleSelect: (task_id: number) => void;
}

export default function SelectorPage(props: SelectorPageProps): ReactElement {
    const navigate = useNavigate();
    
    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button">SELECT A TASK</button>
            </div>
            <div className="content">
                <TaskList tasks={props.tg.all_tasks} handleClick={(id) => {props.handleSelect(id); navigate(-1);}} />
            </div>
        </>
    );
}
