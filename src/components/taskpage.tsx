import { ReactElement, useState, useEffect, useRef } from "react";
import TaskDetails from "./task_details";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { TaskGraph } from "../taskgraph";
import { RawTask, Task } from "../task";


interface TaskPageProps {
    tg: TaskGraph;
    handleSave: (rt: RawTask) => void;
}

interface TaskPageInternalProps {
    task: Task;
    handleSave: (rt: RawTask) => void;
}

interface EditorState {
    rt: RawTask;
}

export default function TaskPage(props: TaskPageProps): ReactElement {
    const { task_id } = useParams();
    const id = parseFloat(task_id ?? "NaN");
    const task = props.tg.get_task_by_id(id);

    if(task) {
        return <TaskPageInternal task={task} handleSave={props.handleSave} key={id} />;
    }
    else {
        return <Navigate to="/" />;
    }
}

function TaskPageInternal(props: TaskPageInternalProps): ReactElement {
    const navigate = useNavigate();
    const rt = props.task.to_raw_task();
    const [editorState, setEditorState] = useState<EditorState>({rt: rt});

    const editorStateRef = useRef<EditorState>();
    editorStateRef.current = editorState;
    function before_leaving_page() {
        props.handleSave(editorStateRef.current!.rt);
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
    }, [editorState.rt.dependencies]);

    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button" onClick={() => navigate(-1)}>￩</button>
                <button className="top-controls-button" onClick={() => navigate("/")}>⌂</button>
            </div>
            <div className="content">
            <TaskDetails task={props.task}
                         enabled_progresses={["todo", "doing", "done", "failed"]}
                         editor_state={editorState.rt}
                         handleChange={(rt) => setEditorState({...editorState, rt: rt})} />
            </div>
        </>
    );
}
