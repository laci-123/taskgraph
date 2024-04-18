import { ReactElement } from "react";
import { Task } from "../task";
import { DATE_MAX } from "../date_utils";


interface TaskEffectiveDeadlineProps {
    task: Task;
}

export default function TaskEffectiveDeadline(props: TaskEffectiveDeadlineProps): ReactElement {
    if(props.task.effective_deadline !== props.task.deadline && props.task.effective_deadline <= DATE_MAX) {
        return (
            <div className="task-effective-deadline-label">
                Computed: {props.task.effective_deadline.toISOString().split("T")[0]}
            </div>
        );
    }
    else {
        return <></>;
    }
}
