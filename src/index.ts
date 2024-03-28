import {Counter} from "./counter";

const button = document.getElementById("button");
const output = document.getElementById("output");

if (button && output)
{
    const counter = new Counter(0);
    button.addEventListener("click", (_) => {
        counter.increase(1);
        output.innerHTML = `Már ${counter.get_value()} alkalommal megnyomták a gombot!`;
    });
}
