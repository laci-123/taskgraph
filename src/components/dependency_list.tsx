import { ReactElement } from "react";
import { Task } from "../task";


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
                                                         <div className="dependency-list-item">
                                                             {t.name}
                                                         </div>
                                                         <button className="remove-dependency">x</button>
                                                     </li>)
                }
            </ul>
            <button className="task-add-dependency">Add</button>
        </div>
    );
}
