import { ReactElement, useState } from "react";
import { DATE_MAX, in_n_days } from "../date_utils";
import { DayPicker } from "react-day-picker";


interface TaskDeadlineProps {
    deadline: Date
    handleChange: (e: Date) => void;
}

export default function TaskDeadline(props: TaskDeadlineProps): ReactElement {
    const [month, setMonth] = useState<Date>(props.deadline);
    
    function handleSelect(date: Date | undefined) {
        if(date) {
            const timezone_offset = date.getTimezoneOffset() * 60 * 1000;
            props.handleChange(new Date(date.getTime() - timezone_offset));
        }
        else {
            props.handleChange(props.deadline);
        }
    }

    function set_deadline(date: Date) {
        props.handleChange(date);
        setMonth(date);
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
                <DayPicker mode="single"
                           weekStartsOn={1/*Monday*/}
                           month={month}
                           onMonthChange={setMonth}
                           modifiersClassNames={{today: "daypicker-today"}}
                           selected={props.deadline}
                           onSelect={handleSelect} />
                <div className="task-horizontal-group">
                    <button onClick={() => set_deadline(in_n_days(0))}>Today</button>
                    <button onClick={() => set_deadline(in_n_days(1))}>Tomorrow</button>
                </div>
            </div>
        );
    }
}
