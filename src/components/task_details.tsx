import { ReactElement } from "react";
import { RawTask, Task } from "../task";
import TaskProgress from "./task_progress";
import TaskDeadline from "./task_deadline";
import TaskEffectiveDeadline from "./task_effective_deadline";
import TaskPriority from "./task_priority";
import DependencyList from "./dependency_list";
import UserList from "./user_list";
import { DATE_MAX } from "../date_utils";


interface TaskDetailsProps {
    task: Task;
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
                <TaskProgress progress={props.editor_state.progress ?? "todo"}
                              enabled_progresses={props.task.has_unfinished_dependency() ? ["todo", "failed"] : ["todo", "started", "done", "failed"]}
                              is_failed_disabled={props.task.has_failed_dependency()}
                              handleChange={(p) => props.handleChange({...props.editor_state, progress: p})} />
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
                <TaskDeadline deadline={props.editor_state.deadline ? new Date(props.editor_state.deadline) : DATE_MAX}
        handleChange={(e) => {console.log("Selected date: ", e.toISOString()); props.handleChange({...props.editor_state, deadline: e.getTime()});}} />
                <TaskEffectiveDeadline task={props.task} />
            </div>
            <TaskPriority priority={props.editor_state.priority || 0}
                          handleChange={(priority) => props.handleChange({...props.editor_state, priority: priority})} />
            <DependencyList task={props.task} handleChange={(ids) => {
                                                               if(ids.length === 0) {
                                                                   props.handleChange({...props.editor_state, dependencies: ids, progress: "todo"});
                                                               }
                                                               else {
                                                                   props.handleChange({...props.editor_state, dependencies: ids});
                                                               }
                                                            }} />
            <UserList task={props.task} />
        </div>
    );
}
