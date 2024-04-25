import { ReactElement } from "react";


interface TaskPriorityProps {
    priority: number;
    handleChange: (e: number) => void;
}

export default function TaskPriority(props: TaskPriorityProps): ReactElement {
    return (
        <div className="task-horizontal-group">
            <div>Priority:</div>
            <button className="task-priority-button" onClick={() => props.handleChange(props.priority - 1)}>-</button>
            <div>{props.priority}</div>
            <button className="task-priority-button" onClick={() => props.handleChange(props.priority + 1)}>+</button>
        </div>
    );
}
