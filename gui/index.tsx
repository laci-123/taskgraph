import {createRoot} from "react-dom/client";
// import App from "./app";
import * as wasm from "taskgraph";


if("serviceWorker" in navigator) {
    try {
        navigator.serviceWorker.register("service-worker.js");
    }
    catch(e) {
        console.error(`Service Worker registration failed: ${e}`);
    }
}
else {
    console.log("Service Workers are not supported");
}

wasm.greet();

const root_element = document.getElementById("root")!;
const root = createRoot(root_element);
const apples = wasm.some_string(3, 5);
root.render(<div>{apples}</div>);
