import { createContext, useCallback, useContext, useState } from "react";
import { Colors } from "../styles/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => !prev);
    }, []);

    const colors = isDark ? Colors.dark : Colors.light;

    return <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
