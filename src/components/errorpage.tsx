import { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";


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
        return (
            <>
                <Toaster />
                <Outlet />
            </>
        );
    }
}
