import { ReactElement, useState } from "react";
import { Progress, Task } from "../task";


interface TaskDetailsProps {
    task: Task;
    enabled_progresses: Progress[];
}

interface EditorState {
    name: string;
}

export default function TaskDetails(props: TaskDetailsProps): ReactElement {
    const [state, setState] = useState<EditorState>({name: props.task.name});

    return (
        <div className="task-details">
            <input type="text"
                   placeholder="Do something..."
                   className="task-name-input"
                   value={state.name}
                   onChange={(e) => {setState({...state, name: e.target.value})}}>
            </input>
            <div className="task-horizontal-group">
                <select className="task-select-box">
                </select>
            </div>
        </div>
    );
}
