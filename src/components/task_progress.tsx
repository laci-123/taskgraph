import { ReactElement } from "react";
import { Progress, Task } from "../task";


interface TaskProgressProps {
    task: Task;
    enabled_progresses: Progress[];
}

export default function TaskProgress(props: TaskProgressProps): ReactElement {
    if(props.task.progress === "blocked") {
        return <div className="task-progress-input-disabled">BLOCKED</div>;
    }
    else {
        return (
            <select className="task-select-box" defaultValue={props.task.progress}>
                {props.enabled_progresses.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
        );
    }
}
