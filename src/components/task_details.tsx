import { ReactElement, useState } from "react";
import { Progress, Task } from "../task";
import TaskProgress from "./task_progress";
import TaskDeadline from "./task_deadline";
import { MaybeDate } from "../maybedate";


interface TaskDetailsProps {
    task: Task;
    enabled_progresses: Progress[];
}

interface EditorState {
    name: string;
    deadline: MaybeDate;
}

export default function TaskDetails(props: TaskDetailsProps): ReactElement {
    const [state, setState] = useState<EditorState>({name: props.task.name, deadline: props.task.deadline});

    return (
        <div className="task-details">
            <input type="text"
                   placeholder="Do something..."
                   className="task-name-input"
                   value={state.name}
                   onChange={(e) => setState({...state, name: e.target.value})}>
            </input>
            <div className="task-horizontal-group">
                <div>Progress:</div>
                <TaskProgress task={props.task} enabled_progresses={props.enabled_progresses} />
            </div>
            <TaskDeadline deadline={state.deadline} handleChange={(e) => setState({...state, deadline: e.deadline})} />
        </div>
    );
}
