import { ReactElement } from "react";
import { Progress, progress_type_values } from "../task";


export type MainSelectorOptionKeys = Progress | "agenda" | "all";

interface MainSelectorProps {
    selected: MainSelectorOptionKeys;
}

const options = [["agenda", "Agenda"],
                 ...progress_type_values.map((v) => [`${v}`, `All ${v.toUpperCase()} tasks`]),
                 ["all", "All tasks"]];


export default function MainSelector(props: MainSelectorProps): ReactElement {
    return (
        <select className="main-selector" defaultValue={props.selected}>
            {
                options.map(([k, v]) => <option key={k} value={k}>
                                            {v}
                                        </option>)
            }
        </select>
    );
}
