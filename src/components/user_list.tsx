import { ReactElement } from "react";
import { Task } from "../task";
import { Link } from "react-router-dom";


interface UserListProps {
    task: Task;
}

export default function UserList(props: UserListProps): ReactElement {
    return (
        <div className="task-vertical-group">
            <div>Other tasks that depend on this one:</div>
            <ul>
                {
                    props.task.needed_by.map((t) => <li key={t.id} className="task-horizontal-group">
                                                         <Link to={`/task/${t.id}`} className="task-link">
                                                             <div className="dependency-list-item">
                                                                 {t.name}
                                                             </div>
                                                         </Link>
                                                     </li>)
                }
            </ul>
        </div>
    );
}
