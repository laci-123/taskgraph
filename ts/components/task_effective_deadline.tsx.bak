import { ReactElement } from "react";
import { Task } from "../task";
import { DATE_MAX, date_to_YMD, dates_equal } from "../date_utils";


interface TaskEffectiveDeadlineProps {
    task: Task;
}

export default function TaskEffectiveDeadline(props: TaskEffectiveDeadlineProps): ReactElement {
    if(!dates_equal(props.task.effective_deadline, props.task.deadline) && props.task.effective_deadline <= DATE_MAX) {
        return (
            <div className="task-effective-deadline-label">
                Computed: {date_to_YMD(props.task.effective_deadline)}
            </div>
        );
    }
    else {
        return <></>;
    }
}
