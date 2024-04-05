import { ReactElement } from "react";


const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function TaskList(): ReactElement {
    return (
        <ul className="task-list">
            {tasks.map((t) => <li className="task-list-item">{t}</li>)}
        </ul>
    );
}
