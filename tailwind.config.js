/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                gilroy: ["Gilroy", "sans-serif"],
            },
            fontSize: {
                heading: "16px",
                content: "14px",
                paragraph: "13px",
            },
            spacing: {
                gutter: "20px",
                margin: "30px",
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                customTheme: {
                    primary: "#00acba",
                    secondary: "#00163b",
                    accent: "#1B1725",
                    base: "#000F29",
                    // neutral: "#e6eafc",
                    neutral: "#f4f7ff",
                    info: "#aaaaaa",
                    "info-content": "#888888",
                    success: "#48DAB3",
                    warning: "#ff9e69",
                    error: "#ec4f5f",
                    "base-100": "#f1f4ff",
                    "base-200": "#E9EDFF",
                    "base-300": "#d7e0ff",
                },
            },
        ],
    },
};
