import { ReactElement } from "react";
import { DATE_MAX } from "../date_utils";
import { DayPicker } from "react-day-picker";


interface TaskDeadlineProps {
    deadline: Date
    handleChange: (e: Date) => void;
}

export default function TaskDeadline(props: TaskDeadlineProps): ReactElement {
    function handleSelect(date: Date | undefined) {
        if(date) {
            const timezone_offset = date.getTimezoneOffset() * 60 * 1000;
            props.handleChange(new Date(date.getTime() - timezone_offset));
        }
        else {
            props.handleChange(props.deadline);
        }
    }
    
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
                <DayPicker mode="single" weekStartsOn={1/*Monday*/} selected={props.deadline} onSelect={handleSelect} />
            </div>
        );
    }
}
