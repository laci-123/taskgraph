import { ReactElement } from "react";


interface TopControlsButtonProps {
    text: string;
}

export default function TopControlsButton(props: TopControlsButtonProps): ReactElement {
    return <button className="top-controls-button">{props.text}</button>;
}
