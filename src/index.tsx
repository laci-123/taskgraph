import {createRoot} from "react-dom/client";
import App from "./app";


const root_element = document.getElementById("root")!;
const root = createRoot(root_element);
root.render(<App />);
