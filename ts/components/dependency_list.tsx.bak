import { ReactElement } from "react";
import { Task } from "../task";
import { Link } from "react-router-dom";


interface DependencyListProps {
    task: Task;
    handleChange: (ids: number[]) => void;
}

export default function DependencyList(props: DependencyListProps): ReactElement {
    const dep_ids = props.task.depends_on.map((t) => t.id);
    
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
                                                         <button className="remove-dependency"
                                                                 onClick={(_) => props.handleChange(dep_ids.filter((id) => id !== t.id))}>
                                                             x
                                                         </button>
                                                     </li>)
                }
            </ul>
            <Link className="task-add-dependency" to={`/selector/${props.task.id}`}>Add</Link>
        </div>
    );
}
