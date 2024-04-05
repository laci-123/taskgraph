import { ReactElement } from "react";
import { Progress, progress_type_values } from "../task";


type OptionKeys = Progress | "agenda" | "all";

interface MainSelectorProps {
    selected: OptionKeys;
}

const options = [["agenda", "Agenda"],
                 ...progress_type_values.map((v) => [`v`, `All ${v.toUpperCase()} tasks`]),
                 ["all", "All tasks"]];


export default function MainSelector(props: MainSelectorProps): ReactElement {
    return (
        <select className="main-selector">
            {
                options.map(([k, v]) => <option value={k} selected={k === props.selected}>
                                            {v}
                                        </option>)
            }
        </select>
    );
}
