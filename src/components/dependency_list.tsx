import { ReactElement } from "react";
import { Task } from "../task";
import { Link } from "react-router-dom";


interface DependencyListProps {
    task: Task;
}

export default function DependencyList(props: DependencyListProps): ReactElement {
    return (
        <div className="task-vertical-group">
            <div>Dependes on:</div>
            <ul>
                {
                    props.task.depends_on.map((t) => <li key={t.id} className="task-horizontal-group">
                                                         <Link to={`/task/${t.id}`} className="task-link">
                                                             <div className="dependency-list-item">
                                                                 {t.name}
                                                             </div>
                                                         </Link>
                                                         <button className="remove-dependency">x</button>
                                                     </li>)
                }
            </ul>
            <Link className="task-add-dependency" to={`/selector/${props.task.id}`}>Add</Link>
        </div>
    );
}
