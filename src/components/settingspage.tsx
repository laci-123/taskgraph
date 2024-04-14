import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function SettingsPage(): ReactElement {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        if(isDark) {
            document.body.classList.add("dark-mode");
        }
        else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDark]);

    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button" onClick={() => navigate(-1)}>￩</button>
            </div>
            <div className="content">
                <div className="settings">
                    <input name="dadk-mode"
                        type="checkbox"
                        checked={isDark}
                        onChange={() => setIsDark(!isDark)}>
                    </input>
                    <label htmlFor="dark-mode">Dark mode</label>
                </div>
            </div>
        </>
    );
}
