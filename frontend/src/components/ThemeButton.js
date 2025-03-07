import React, { useState, useEffect } from "react";


export default function ThemeButton() {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);
    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="dark-mode-toggle"
        >
            {darkMode ? <i class='bi bi-cloud-sun-fill'></i> : <i class='bi bi-moon-stars-fill'></i>}
        </button >
    )
}
