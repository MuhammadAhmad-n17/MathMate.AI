import React from "react";

export const Button = ({ children, className = "", variant = "primary", isLoading, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-in-out px-6 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5",
    secondary: "bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 hover:border-indigo-500 text-white shadow-sm hover:shadow-md",
    ghost: "bg-transparent hover:bg-white/10 text-gray-300 hover:text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
