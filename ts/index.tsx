import {createRoot} from "react-dom/client";
// import App from "./app";


if("serviceWorker" in navigator) {
    try {
        navigator.serviceWorker.register("sw.js");
    }
    catch(e) {
        console.error(`Service Worker registration failed: ${e}`);
    }
}
else {
    console.log("Service Workers are not supported");
}


const root_element = document.getElementById("root")!;
const root = createRoot(root_element);
root.render(<div>Hello, World!</div>);
