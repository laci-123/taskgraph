import { ReactElement } from "react";


interface TaskPriorityProps {
    priority: number;
    handleChange: (e: number) => void;
}

export default function TaskPriority(props: TaskPriorityProps): ReactElement {
    return (
        <div className="task-horizontal-group">
            <div>Priority:</div>
            <input type="number"
                   value={props.priority}
                   onChange={(e) => {
                       const x = e.target.valueAsNumber;
                       if(!isNaN(x)) {
                           props.handleChange(x);
                       }
                   }}>
            </input>
        </div>
    );
}
