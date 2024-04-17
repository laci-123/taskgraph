import { ReactElement, useRef } from "react";
import { TaskGraph } from "../taskgraph";


interface TaskImportProps {
    tg: TaskGraph;
    handleTaskImport: (tasks_json: string) => void;
}

export default function TaskImport(props: TaskImportProps): ReactElement {
    const file_input = useRef<HTMLInputElement>(null);

    async function read_file() {
        if(!file_input.current) {
            return;
        }
        const files = file_input.current.files;
        if(!files || files.length === 0) {
            return;
        }
        if(files.length > 1) {
            throw new Error("multiple selection is not enabled on file input element but received multiple files");
        }

        const text = await files.item(0)!.text();
        props.handleTaskImport(text);
        file_input.current.value = "";
    }
    
    return (
        <div className="import-group">
            <div>Import tasks</div>
            <input type="file" ref={file_input} />
            <button className="import-button" onClick={read_file}>Import</button>
        </div>
    );
}
