import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { Classes } from "@blueprintjs/core";
import { ThemeContext } from "./theme-context";

const THEME_STORAGE_KEY = "skilltrack_theme";

function getInitialTheme() {
	try {
		const saved = localStorage.getItem(THEME_STORAGE_KEY);
		if (saved === "light" || saved === "dark") {
			return saved;
		}
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			return "dark";
		}
	} catch {
		// ignore storage / matchMedia errors
	}
	return "light";
}

function applyThemeClasses(targetTheme) {
	const root = document.documentElement;
	if (targetTheme === "dark") {
		root.classList.add("dark", Classes.DARK);
		root.style.colorScheme = "dark";
	} else {
		root.classList.remove("dark", Classes.DARK);
		root.style.colorScheme = "light";
	}
}

export function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState(getInitialTheme);

	useEffect(() => {
		applyThemeClasses(theme);
	}, [theme]);

	const setTheme = useCallback((nextTheme) => {
		const normalized = nextTheme === "dark" ? "dark" : "light";
		setThemeState(normalized);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, normalized);
		} catch {
			// ignore storage errors
		}
	}, []);

	const toggleTheme = useCallback(
		(event) => {
			const nextTheme = theme === "dark" ? "light" : "dark";

			const isAppearanceTransition =
				typeof document !== "undefined" &&
				"startViewTransition" in document &&
				!window.matchMedia("(prefers-reduced-motion: reduce)").matches;

			if (!isAppearanceTransition) {
				setTheme(nextTheme);
				return;
			}

			let x = window.innerWidth / 2;
			let y = window.innerHeight / 2;

			if (
				event &&
				typeof event.clientX === "number" &&
				(event.clientX !== 0 || event.clientY !== 0)
			) {
				x = event.clientX;
				y = event.clientY;
			} else if (event?.currentTarget?.getBoundingClientRect) {
				const rect = event.currentTarget.getBoundingClientRect();
				x = rect.left + rect.width / 2;
				y = rect.top + rect.height / 2;
			}

			const endRadius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y)
			);

			try {
				const transition = document.startViewTransition(() => {
					flushSync(() => {
						setTheme(nextTheme);
						applyThemeClasses(nextTheme);
					});
				});

				transition.ready
					.then(() => {
						const clipPath = [
							`circle(0px at ${x}px ${y}px)`,
							`circle(${endRadius}px at ${x}px ${y}px)`,
						];
						document.documentElement.animate(
							{
								clipPath,
							},
							{
								duration: 450,
								easing: "ease-in-out",
								pseudoElement: "::view-transition-new(root)",
							}
						);
					})
					.catch(() => {
						// transition interrupted or aborted
					});
			} catch {
				setTheme(nextTheme);
			}
		},
		[theme, setTheme]
	);

	return (
		<ThemeContext.Provider
			value={{ theme, isDark: theme === "dark", setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
