import { ReactElement, useState } from "react";
import { Progress, Task } from "../task";
import { MaybeDate } from "../maybedate";
import TaskProgress from "./task_progress";
import TaskDeadline from "./task_deadline";
import TaskEffectiveDeadline from "./task_effective_deadline";
import TaskPriority from "./task_priority";


interface TaskDetailsProps {
    task: Task;
    enabled_progresses: Progress[];
}

interface EditorState {
    name: string;
    deadline: MaybeDate;
    priority: number;
}

export default function TaskDetails(props: TaskDetailsProps): ReactElement {
    const [state, setState] = useState<EditorState>({name: props.task.name,
                                                     deadline: props.task.deadline,
                                                     priority: props.task.priority});

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
            <div className="task-vertical-group">
                <TaskDeadline deadline={state.deadline} handleChange={(e) => setState({...state, deadline: e.deadline})} />
                <TaskEffectiveDeadline task={props.task} />
            </div>
            <TaskPriority priority={state.priority} handleChange={(priority) => setState({...state, priority: priority})} />
        </div>
    );
}
