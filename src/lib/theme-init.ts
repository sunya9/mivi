// Inlined into index.html by inlineThemeInitPlugin (vite.config.ts) to apply
// the theme before first paint. Keep this file free of imports (even type-only):
// they turn the output into a module, which is invalid inside a classic <script>.
type Theme = "light" | "dark" | "system";

(function () {
  try {
    const theme = localStorage.getItem("theme") as Theme | null;
    const resolved =
      theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch {
    // localStorage/matchMedia may be unavailable; ThemeProvider applies the theme on mount
  }
})();
