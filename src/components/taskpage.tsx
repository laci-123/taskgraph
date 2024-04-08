import { ReactElement, useState } from "react";
import FloatingButton from "./floating_button";
import TaskDetails from "./task_details";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TaskGraph } from "../taskgraph";
import { RawTask, Task } from "../task";


interface TaskPageProps {
    tg: TaskGraph;
    handleSave: (rt: RawTask) => void;
}

interface TaskPageInternalProps {
    task: Task;
    handleSave: (rt: RawTask) => void;
}

export default function TaskPage(props: TaskPageProps): ReactElement {
    const { task_id } = useParams();
    const id = parseFloat(task_id ?? "NaN");
    const task = props.tg.get_task_by_id(id);

    if(task) {
        return <TaskPageInternal task={task} handleSave={props.handleSave} key={id} />;
    }
    else {
        return <Navigate to="/" />;
    }
}

function TaskPageInternal(props: TaskPageInternalProps): ReactElement {
    const navigate = useNavigate();
    const [editorState, setEditorState] = useState<RawTask>(props.task.to_raw_task());
    
    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button" onClick={() => navigate(-1)}>￩</button>
                <button className="top-controls-button" onClick={() => navigate("/")}>⌂</button>
            </div>
            <div className="content">
            <TaskDetails task={props.task}
                         enabled_progresses={["todo", "doing", "done", "failed"]}
                         editor_state={editorState}
                         handleChange={(rt) => {setEditorState(rt)}} />
            </div>
            <div className="bottom-controls">
            <FloatingButton role="save-task" onClick={() => {props.handleSave(editorState)}} />
            </div>
        </>
    );
}
