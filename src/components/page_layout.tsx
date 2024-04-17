import { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";


export default function PageLayout(): ReactElement {
    return (
        <>
            <Toaster />
            <Outlet />
        </>
    );
}
