// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle-button");
    const body = document.body;
    const DARK_THEME = "dark";
    const LIGHT_THEME = "light";
    const THEME_STORAGE_KEY = "theme";
    const SYSTEM_PREF_DARK = "(prefers-color-scheme: dark)";

    // Check for system preference
    const systemPrefersDark = window.matchMedia && window.matchMedia(SYSTEM_PREF_DARK).matches;

    // Function to set theme that handles all the DOM changes and saves preference
    function setTheme(theme, savePreference = true)
    {
        const isDark = theme === DARK_THEME;

        // Update DOM
        body.classList.toggle("dark-theme", isDark);

        // Update button aria-label for accessibility
        // themeToggleBtn.setAttribute('aria-label',
        //     isDark ? 'Switch to light theme' : 'Switch to dark theme'
        // );

        // Update theme-color meta tag for mobile browsers
        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", isDark ? "#121212" : "#f5f5f5");
        }

        // Save to localStorage if requested
        if (savePreference) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }

        const themeChangeEvent = new CustomEvent("themeChanged", { detail: { theme: theme } });
        window.dispatchEvent(themeChangeEvent);
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme)
    {
        // User has a saved preference, use that
        setTheme(savedTheme, false);
    }
    else
    {
        // No preference saved, use system preference
        setTheme(systemPrefersDark ? DARK_THEME : LIGHT_THEME, false);
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        const isDarkNow = body.classList.contains("dark-theme");

        setTheme(isDarkNow ? LIGHT_THEME : DARK_THEME);
    });

    // Handle keyboard navigation
    themeToggleBtn.addEventListener("keydown", (event) => {
        if ((event.key === "Enter") || (event.key === " "))
        {
            event.preventDefault();

            themeToggleBtn.click();
        }
    });

    // Update theme based on system preference changes
    const mediaQuery = window.matchMedia(SYSTEM_PREF_DARK);

    // Modern browsers
    if (mediaQuery.addEventListener)
    {
        mediaQuery.addEventListener("change", (event) => {
            // Only apply if the user hasn't explicitly set a preference
            if (!localStorage.getItem(THEME_STORAGE_KEY))
            {
                setTheme(event.matches ? DARK_THEME : LIGHT_THEME, false);
            }
        });
    }

    // Add animation class to theme toggle for initial load
    setTimeout(() => {
        themeToggleBtn.classList.add("initialized");
    }, 100);
});
