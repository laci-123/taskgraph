import { ReactElement } from "react";
import { Outlet } from "react-router-dom";


interface ErrorPageProps {
    error: Error | null;
    resetError: () => void;
}

export default function ErrorPage(props: ErrorPageProps): ReactElement {
    if(props.error) {
        return (
            <div>
                {`ERROR: ${props.error}`}
                <button onClick={props.resetError}>OK</button>
            </div>
        );
    }
    else {
        return <Outlet />;
    }
}
