// import { createContext, useState, useEffect } from "react";

// export const ThemeContext = createContext();

// export function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState(
//     localStorage.getItem("admin-theme") || "default"
//   );

//   useEffect(() => {
//     applyTheme(theme);
//   }, [theme]);

//   const applyTheme = (themeName) => {
//     const root = document.documentElement;
//     const themes = {
//       default: {
//         "--sidebar-bg": "#1e293b",
//         "--sidebar-text": "#ffffff",
//         "--sidebar-active": "#1fc1de",
//       },
//       blue: {
//         "--sidebar-bg": "#1d4ed8",
//         "--sidebar-text": "#f8fafc",
//         "--sidebar-active": "#93c5fd",
//       },
//       green: {
//         "--sidebar-bg": "#065f46",
//         "--sidebar-text": "#ecfdf5",
//         "--sidebar-active": "#34d399",
//       },
//       purple: {
//         "--sidebar-bg": "#6d28d9",
//         "--sidebar-text": "#f3e8ff",
//         "--sidebar-active": "#c084fc",
//       },
//     };

//     Object.entries(themes[themeName]).forEach(([key, val]) => {
//       root.style.setProperty(key, val);
//     });
//     localStorage.setItem("admin-theme", themeName);
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }
