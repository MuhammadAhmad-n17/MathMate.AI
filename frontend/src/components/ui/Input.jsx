import React, { forwardRef } from "react";

export const Input = forwardRef(({ className = "", error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 ${
          error ? "border-red-500 focus:ring-red-500/50" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400 animate-pulse">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
