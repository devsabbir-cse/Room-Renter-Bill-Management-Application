import React from 'react';

const ErrorMessage = ({ error }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="mb-4 text-3xl text-red-600">
      <span role="img" aria-label="error">⚠️</span>
    </div>
    <p className="text-lg text-gray-600">Oops! Something went wrong.</p>
    <p className="text-lg text-red-500">{error}</p>
  </div>
);

export default ErrorMessage;
