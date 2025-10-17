// import { useContext } from "react";
// import { ThemeContext } from "./ThemeContext";

// const themeOptions = [
//   { name: "default", color: "#1e293b" },
//   { name: "blue", color: "#1d4ed8" },
//   { name: "green", color: "#065f46" },
//   { name: "purple", color: "#6d28d9" },
// ];

// export default function ThemeSwitcher() {
//   const { theme, setTheme } = useContext(ThemeContext);

//   return (
//     <div className="theme-switcher">
//       {themeOptions.map((opt) => (
//         <button
//           key={opt.name}
//           className={`theme-btn ${theme === opt.name ? "active" : ""}`}
//           style={{
//             backgroundColor: opt.color,
//             border: theme === opt.name ? "2px solid #fff" : "none",
//           }}
//           onClick={() => setTheme(opt.name)}
//           title={opt.name}
//         />
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import "./theme.css";

const themes = {
  dark: "#1e293b",
  blue: "#107f90ff",
  green: "#065f46",
  purple: "#353437ff",
};

// export default function ThemeSwitcher() {
//   const [current, setCurrent] = useState(localStorage.getItem("sidebar-theme") || "dark");

//   useEffect(() => {
//     applyTheme(current);
//   }, [current]);

// //   const applyTheme = (themeKey) => {
// //     const color = themes[themeKey];
// //     document.documentElement.style.setProperty("--sidebar-bg", color);
// //     localStorage.setItem("sidebar-theme", themeKey);
// //   };
// const applyTheme = (themeKey) => {
//   const color = themes[themeKey];
//   document.documentElement.style.setProperty("--sidebar-bg", color);

//   // make transparent version for content area
//   const rgba = hexToRgba(color, 0.08);
//   document.documentElement.style.setProperty("--content-bg", rgba);

//   localStorage.setItem("sidebar-theme", themeKey);
// };

// // helper to convert hex → rgba
// function hexToRgba(hex, alpha) {
//   const r = parseInt(hex.slice(1, 3), 16);
//   const g = parseInt(hex.slice(3, 5), 16);
//   const b = parseInt(hex.slice(5, 7), 16);
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }


//   return (
//     <div className="theme-switcher">
//       {Object.entries(themes).map(([key, color]) => (
//         <button
//           key={key}
//           className={`theme-btn ${current === key ? "active" : ""}`}
//           style={{ backgroundColor: color }}
//           onClick={() => setCurrent(key)}
//           title={key}
//         />
//       ))}
//     </div>
//   );
// }
export default function ThemeSwitcher() {
  const [current, setCurrent] = useState(localStorage.getItem("sidebar-theme") || "dark");

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  const applyTheme = (themeKey) => {
    const color = themes[themeKey];
    document.documentElement.style.setProperty("--sidebar-bg", color);
    document.documentElement.style.setProperty("--content-bg", getLightTint(color));
    localStorage.setItem("sidebar-theme", themeKey);
  };

  // ✅ auto-generate soft transparent tint for dashboard-content
  const getLightTint = (hex) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`; // light transparent tint
  };

  const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  };

  return (
    <div className="theme-switcher">
      {Object.entries(themes).map(([key, color]) => (
        <button
          key={key}
          className={`theme-btn ${current === key ? "active" : ""}`}
          style={{ backgroundColor: color }}
          onClick={() => setCurrent(key)}
          title={key}
        />
      ))}
    </div>
  );
}
