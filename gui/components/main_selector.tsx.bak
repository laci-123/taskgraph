import { ReactElement } from "react";
import { Progress, isProgress, progress_type_values } from "../task";


export type MainSelectorOptionKeys = Progress | "agenda" | "all";

export function isMainSelectorOptionKey(x: any): x is MainSelectorOptionKeys {
    return isProgress(x) || x === "agenda" || x === "all";
}

interface MainSelectorProps {
    selected: MainSelectorOptionKeys;
    handleChange: (e: MainSelectorOptionKeys) => void;
}

const options = [["agenda", "Agenda"],
                 ...progress_type_values.map((v) => [`${v}`, `All ${v.toUpperCase()} tasks`]),
                 ["all", "All tasks"]];


export default function MainSelector(props: MainSelectorProps): ReactElement {
    return (
        <select className="main-selector"
                defaultValue={props.selected}
                onChange={(e) => props.handleChange(e.target.value as MainSelectorOptionKeys)}>
            {
                options.map(([k, v]) => <option key={k} value={k}>
                                            {v}
                                        </option>)
            }
        </select>
    );
}
