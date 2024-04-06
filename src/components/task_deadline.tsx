import { ReactElement } from "react";
import { MaybeDate } from "../maybedate";


interface TaskDeadlineState {
    deadline: MaybeDate;
}

interface TaskDeadlineProps {
    deadline: MaybeDate
    handleChange: (e: TaskDeadlineState) => void;
}

export default function TaskDeadline(props: TaskDeadlineProps): ReactElement {
    if(props.deadline === "never") {
        return( 
            <div className="task-vertical-group">
                <div>
                    <input name="task-has-deadline"
                           type="checkbox"
                           checked={false}
                           onChange={(e) => props.handleChange({deadline: e.target.checked ? new Date() : "never"})}>
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
                           onChange={(e) => props.handleChange({deadline: e.target.checked ? new Date() : "never"})}>
                    </input>
                    <label htmlFor="task-has-deadline">Deadline</label>
                </div>
                <input type="date"
                       value={props.deadline.toISOString().split("T")[0]}
                       onChange={(e) => props.handleChange({deadline: e.target.valueAsDate!})}>
                </input>
            </div>
        );
    }
}
