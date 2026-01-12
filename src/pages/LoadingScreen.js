import React from "react";
import logo from "../finance_logo.png"; // update path to your logo

function LoadingScreen() {
  return React.createElement(
    "div",
    {
      className:
        "flex flex-col items-center justify-center h-screen bg-gray-900 text-white",
    },
    [
      // Logo
      React.createElement("img", {
        key: "logo",
        src: logo,
        alt: "App Logo",
        className: "w-28 h-28 mb-6 animate-pulse",
      }),

      // Loading bar wrapper
      React.createElement(
        "div",
        {
          key: "barWrapper",
          className: "w-40 h-2 bg-gray-700 rounded-full overflow-hidden",
        },
        React.createElement("div", {
          className: "h-full bg-blue-500 animate-loading-bar",
        })
      ),

      // Optional text
      React.createElement(
        "p",
        { key: "text", className: "mt-4 text-sm opacity-70" },
        "Loading..."
      ),
    ]
  );
}

export default LoadingScreen;
