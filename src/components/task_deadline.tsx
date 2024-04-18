import { ReactElement } from "react";
import { DATE_MAX } from "../maybedate";


interface TaskDeadlineProps {
    deadline: Date
    handleChange: (e: Date) => void;
}

export default function TaskDeadline(props: TaskDeadlineProps): ReactElement {
    if(props.deadline >= DATE_MAX) {
        return( 
            <div className="task-vertical-group">
                <div>
                    <input name="task-has-deadline"
                           type="checkbox"
                           checked={false}
                           onChange={(e) => {props.handleChange(e.target.checked ? new Date() : DATE_MAX);}}>
                    </input>
                    <label htmlFor="task-has-deadline">Deadline</label>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="task-vertical-group">
                <div>
                    <input name="task-has-deadline"
                           type="checkbox"
                           checked={true}
                           onChange={(e) => {props.handleChange(e.target.checked ? new Date() : DATE_MAX);}}>
                    </input>
                    <label htmlFor="task-has-deadline">Deadline</label>
                </div>
                <input type="date"
                       value={props.deadline.toISOString().split("T")[0]}
                       onChange={(e) => {props.handleChange(e.target.valueAsDate!);}}>
                </input>
            </div>
        );
    }
}
