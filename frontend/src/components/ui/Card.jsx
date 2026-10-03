import React from "react";

export const Card = ({ children, className = "", hoverEffect = false, ...props }) => {
  return (
    <div
      className={`bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl ${
        hoverEffect ? "transition-all duration-500 hover:shadow-indigo-500/10 hover:border-indigo-500/30 transform hover:-translate-y-1" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
