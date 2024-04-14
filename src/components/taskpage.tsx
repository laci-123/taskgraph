import { ReactElement, useState, useEffect, useRef } from "react";
import TaskDetails from "./task_details";
import { useNavigate, useParams } from "react-router-dom";
import { TaskGraph } from "../taskgraph";
import { RawTask, Task } from "../task";


interface TaskPageProps {
    tg: TaskGraph;
    handleSave: (rt: RawTask, remove?: "remove") => void;
}

interface TaskPageInternalProps {
    task: Task;
    handleSave: (rt: RawTask, remove?: "remove") => void;
}

interface EditorState {
    rt: RawTask;
    remove: boolean;
}

export default function TaskPage(props: TaskPageProps): ReactElement {
    const { task_param } = useParams();
    const task_id = parseFloat(task_param ?? "NaN");
    const task = props.tg.get_task_by_id(task_id) ?? new Task(task_id, "");

    return <TaskPageInternal task={task} handleSave={props.handleSave} key={task.id} />;
}

function TaskPageInternal(props: TaskPageInternalProps): ReactElement {
    const navigate = useNavigate();
    const rt = props.task.to_raw_task();
    const [editorState, setEditorState] = useState<EditorState>({rt: rt, remove: false});

    const editorStateRef = useRef<EditorState>();
    editorStateRef.current = editorState;
    function before_leaving_page() {
        const esrc = editorStateRef.current!;
        props.handleSave(esrc.rt, esrc.remove ? "remove" : undefined);
    }
    useEffect(() => {
        window.onbeforeunload = () => before_leaving_page();
        window.addEventListener("beforeunload", (_) => before_leaving_page());

        return () => {
            before_leaving_page();
            window.removeEventListener("beforeunload", before_leaving_page);
        };
    }, []);

    useEffect(() => {
        props.handleSave(editorState.rt);
    }, [editorState.rt.dependencies, editorState.rt.progress]);

    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button" onClick={() => navigate(-1)}>￩</button>
                <button className="top-controls-button" onClick={() => navigate("/")}>⌂</button>
            </div>
            <div className="content taskpage">
                <TaskDetails task={props.task}
                             editor_state={editorState.rt}
                             handleChange={(rt) => setEditorState({...editorState, rt: rt})} />
                {
                    props.task.needed_by.length === 0
                    ?
                        <button className="remove-task-button"
                                onClick={() => {
                                    setEditorState({...editorState, remove: true});
                                    navigate(-1);
                                }}>
                            Delete this task
                        </button>
                    :
                        <></>
                }
            </div>
        </>
    );
}
