import React from "react";

export const Loader = ({ text = "Processing..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-800 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-2 bg-indigo-500/20 rounded-full blur-md animate-pulse"></div>
    </div>
    <span className="text-gray-400 font-medium tracking-wide animate-pulse">{text}</span>
  </div>
);
