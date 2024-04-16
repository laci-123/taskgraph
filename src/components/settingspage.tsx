import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";


interface SettingsPageProps {
    is_dark: boolean;
    handleChange: (is_dark: boolean) => void;
}

export default function SettingsPage(props: SettingsPageProps): ReactElement {
    const navigate = useNavigate();

    return (
        <>
            <div className="top-controls">
                <button className="top-controls-button" onClick={() => navigate(-1)}>￩</button>
            </div>
            <div className="content">
                <div className="settings">
                    <input name="dadk-mode"
                        type="checkbox"
                        checked={props.is_dark}
                        onChange={() => props.handleChange(!props.is_dark)}>
                    </input>
                    <label htmlFor="dark-mode">Dark mode</label>
                </div>
            </div>
        </>
    );
}
