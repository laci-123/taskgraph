import { ReactElement } from "react";
import TaskList from "./tasklist";
import { TaskGraph } from "../taskgraph";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Task, RawTask } from "../task";


interface SelectorPageProps {
    tg: TaskGraph;
    handleSave: (rt: RawTask) => void;
}

export default function SelectorPage(props: SelectorPageProps): ReactElement {
    const navigate = useNavigate();
    const { task_id } = useParams();
    const task = props.tg.get_task_by_id(parseFloat(task_id ?? "NaN"));
    if(!task) {
        return <Navigate to="/" />;
    }

    function handleClick(task: Task, dep_id: number) {
        const dep_task = props.tg.get_task_by_id(dep_id)!; // we assume TaskList only list valid IDs
        const rt = task.to_raw_task(); 
        if(rt.dependencies) {
            rt.dependencies.push(dep_task.id);
        }
        else {
            rt.dependencies = [dep_task.id];
        }
        props.handleSave(rt);
        navigate(-1);
    }
    
    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button">SELECT A TASK</button>
            </div>
            <div className="content">
                <TaskList tasks={props.tg.all_tasks} handleClick={(id) => handleClick(task, id)} />
            </div>
        </>
    );
}
