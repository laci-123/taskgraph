import { ReactElement } from "react";
import { Progress } from "../task";


interface TaskProgressProps {
    progress: Progress;
    enabled_progresses: Progress[];
    handleChange: (p: Progress) => void;
}

export default function TaskProgress(props: TaskProgressProps): ReactElement {
    if(props.progress === "blocked") {
        return <div className="task-progress-input-disabled">BLOCKED</div>;
    }
    else if(props.progress === "failed") {
        return <div className="task-progress-input-disabled">FAILED</div>;
    }
    else {
        return (
            <select className="task-select-box"
                    defaultValue={props.progress}
                    onChange={(e) => props.handleChange(e.target.value as Progress)}>
                {props.enabled_progresses.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
        );
    }
}
