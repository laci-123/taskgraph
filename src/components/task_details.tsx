import { ReactElement } from "react";
import { Progress, RawTask, Task } from "../task";
import TaskProgress from "./task_progress";
import TaskDeadline from "./task_deadline";
import TaskEffectiveDeadline from "./task_effective_deadline";
import TaskPriority from "./task_priority";
import DependencyList from "./dependency_list";
import UserList from "./user_list";


interface TaskDetailsProps {
    task: Task;
    enabled_progresses: Progress[];
    editor_state: RawTask;
    handleChange: (rt: RawTask) => void;
}

export default function TaskDetails(props: TaskDetailsProps): ReactElement {    
    return (
        <div className="task-details">
            <input type="text"
                   placeholder="Do something..."
                   className="task-name-input"
                   value={props.editor_state.name}
                   onChange={(e) => props.handleChange({...props.editor_state, name: e.target.value})}>
            </input>
            <div className="task-horizontal-group">
                <div>Progress:</div>
                <TaskProgress task={props.task} enabled_progresses={props.enabled_progresses} />
            </div>
            <div className="task-vertical-group">
                <div>Description:</div>
                <textarea rows={3}
                          cols={100}
                          className="task-description-input"
                          value={props.editor_state.description}
                          onChange={(e) => props.handleChange({...props.editor_state, description: e.target.value})}>
                </textarea>
            </div>
            <div className="task-vertical-group">
                <TaskDeadline deadline={props.editor_state.deadline || "never"}
                              handleChange={(e) => props.handleChange({...props.editor_state, deadline: e})} />
                <TaskEffectiveDeadline task={props.task} />
            </div>
            <TaskPriority priority={props.editor_state.priority || 0}
                          handleChange={(priority) => props.handleChange({...props.editor_state, priority: priority})} />
            <DependencyList task={props.task} />
            <UserList task={props.task} />
        </div>
    );
}
