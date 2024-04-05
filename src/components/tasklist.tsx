import { ReactElement } from "react";
import { Task } from "../task";
import { maybedate_to_string_or, is_maybedate_overdue } from "../maybedate";


interface TaskListProps {
    tasks: Task[];
    handleTaskClick: (id: number) => void;
}

function task_to_list_item(task: Task, task_click: (id: number) => void): ReactElement {
    const now = new Date();
    return (
        <li key={task.id} onClick={(_) => task_click(task.id)}>
            <div className="task-progress">{task.progress}</div>
            <div className="task-name">{task.name}</div>
            <div className={`task-deadline ${is_maybedate_overdue(task.effective_deadline, now) ? "task-deadline-overdue" : ""}`}>
                {maybedate_to_string_or(task.effective_deadline, "-")}
            </div>
            <div className="task-priority">{`priority: ${task.priority}`}</div>
        </li>
    );
}

function scroll_to_bottom(e: HTMLElement) {
    e.scrollTop = e.scrollHeight;
}

export default function TaskList(props: TaskListProps): ReactElement {
    return (
        <ul className="task-list" ref={(x) => x && scroll_to_bottom(x)}>
            {props.tasks.map((t) => task_to_list_item(t, props.handleTaskClick))}
        </ul>
    );
}
