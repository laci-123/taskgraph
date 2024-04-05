import { ReactElement } from "react";


type FloatinbButtonRole = "add-task" | "save-task";

interface FloatingButtonProps {
    role: FloatinbButtonRole;
    onClick: () => void;
}

const captions = new Map<FloatinbButtonRole, string>([["add-task",  "+"],
                                                      ["save-task", "✓"]]);

export default function FloatingButton(props: FloatingButtonProps): ReactElement {
    return (
        <button className="floating-button circular" onClick={props.onClick}>
            {captions.get(props.role)}
        </button>
    );
}
