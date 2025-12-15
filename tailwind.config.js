/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Configure the content for all of your components
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
}
