import { ReactElement } from "react";
import TopControlsButton from "./topcontrols_button";
import FloatingButton from "./floating_button";
import TaskDetails from "./task_details";
import { Navigate, useParams } from "react-router-dom";
import { TaskGraph } from "../taskgraph";
import { Task } from "../task";


interface TaskPageProps {
    tg: TaskGraph;
}

interface TaskPageInternalProps {
    task: Task;
}

export default function TaskPage(props: TaskPageProps): ReactElement {
    const { task_id } = useParams();
    const id = parseFloat(task_id ?? "NaN");
    const task = props.tg.get_task_by_id(id);

    if(task) {
        return <TaskPageInternal task={task} key={id} />;
    }
    else {
        return <Navigate to="/" />;
    }
}

function TaskPageInternal(props: TaskPageInternalProps): ReactElement {
    return (
        <>
            <div className="top-controls">
                <TopControlsButton text="￩"/>
            </div>
            <div className="content">
                <TaskDetails task={props.task} enabled_progresses={["todo", "doing", "done", "failed"]}/>
            </div>
            <div className="bottom-controls">
                <FloatingButton role="save-task" onClick={() => {}} />
            </div>
        </>
    );
}
