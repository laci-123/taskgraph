import { ReactElement } from "react";
import { Task } from "../task";
import { maybedate_to_string_or, is_maybedate_overdue } from "../maybedate";
import { Link } from "react-router-dom";


interface TaskListProps {
    tasks: Task[];
}

function task_to_list_item(task: Task): ReactElement {
    const now = new Date();
    return (
        <li key={task.id}>
            <Link to={`/task/${task.id}`} className="task-link">
                <div className="task-progress">{task.progress}</div>
                <div className="task-name">{task.name}</div>
                <div className={`task-deadline ${is_maybedate_overdue(task.effective_deadline, now) ? "task-deadline-overdue" : ""}`}>
                    {maybedate_to_string_or(task.effective_deadline, "-")}
                </div>
                <div className="task-priority">{`priority: ${task.priority}`}</div>
            </Link>
        </li>
    );
}

function scroll_to_bottom(e: HTMLElement) {
    e.scrollTop = e.scrollHeight;
}

export default function TaskList(props: TaskListProps): ReactElement {
    return (
        <ul className="task-list" ref={(x) => x && scroll_to_bottom(x)}>
            {props.tasks.map((t) => task_to_list_item(t))}
        </ul>
    );
}
