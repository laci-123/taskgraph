import { ReactElement } from "react";
import TopControlsButton from "./topcontrols_button";
import FloatingButton from "./floating_button";
import TaskDetails from "./task_details";
import { useParams } from "react-router-dom";
import { TaskGraph } from "../taskgraph";


interface TaskPageProps {
    tg: TaskGraph;
}

export default function TaskPage(props: TaskPageProps): ReactElement {
    const { task_id } = useParams();
    const task = props.tg.get_task_by_id(parseFloat(task_id ?? "NaN"))!;
    
    return (
        <>
            <div className="top-controls">
                <TopControlsButton text="￩"/>
            </div>
            <div className="content">
                <TaskDetails task={task} enabled_progresses={["todo", "doing", "done", "failed"]}/>
            </div>
            <div className="bottom-controls">
                <FloatingButton role="save-task" onClick={() => {}} />
            </div>
        </>
    );
}
