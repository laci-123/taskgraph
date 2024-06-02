import { ReactElement } from "react";
import { Task } from "../task";
import { Link } from "react-router-dom";
import { date_to_relative_string } from "../date_utils";


interface TaskListProps {
    tasks: Task[];
    handleClick: ((task_id: number) => void) | null;
}

function task_to_list_item(task: Task, handleClick: ((task_id: number) => void) | null): ReactElement {
    const task_is_overdue = task.effective_deadline.getTime() < Date.now();
    const content = (
        <>
            <div className="task-progress">{task.progress}</div>
            <div className="task-name">{task.name}</div>
            <div className={`task-deadline ${task_is_overdue ? "task-deadline-overdue" : ""}`}>
                {date_to_relative_string(task.effective_deadline, new Date(), "-", "-")}
            </div>
            <div className="task-priority">{`priority: ${task.priority}`}</div>
        </>
    );
    if(handleClick) {
        return (
            <li key={task.id} onClick={() => handleClick(task.id)}>
                {content}
            </li>
        );
    }
    else {
        return (
            <li key={task.id}>
                <Link to={`/task/${task.id}`} className="task-link">
                    {content}
                </Link>
            </li>
        );
    }
}

function scroll_to_bottom(e: HTMLElement) {
    e.scrollTop = e.scrollHeight;
}

export default function TaskList(props: TaskListProps): ReactElement {
    return (
        <ul className="task-list" ref={(x) => x && scroll_to_bottom(x)}>
            {props.tasks.reverse().map((t) => task_to_list_item(t, props.handleClick))}
        </ul>
    );
}
