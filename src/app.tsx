import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./homepage";
import { ReactElement } from "react";


export default function App(): ReactElement {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"/>
                <Route path="/index.html" element={<HomePage />} />
                <Route index element={<HomePage />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
}
