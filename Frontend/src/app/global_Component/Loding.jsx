import React from 'react';

const Loading = () => (
  <div className="flex flex-col items-center justify-center w-[100%] h-screen text-white bg-gradient-to-r from-blue-500 to-indigo-600">
    <div className="relative mb-4 loader">
      <div className="outer-circle"></div> {/* Outer animated circle */}
      <div className="inner-circle"></div> {/* Inner static circle */}
    </div>
    <p className="text-xl font-semibold animate-pulse">Loading...</p>
    <style jsx>{`
      .loader {
        position: relative;
        width: 70px;
        height: 70px;
      }

      .outer-circle {
        border: 6px solid rgba(255, 255, 255, 0.2);
        border-top: 6px solid #fff;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        animation: spin 1.5s linear infinite;
      }

      .inner-circle {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 46px;
        height: 46px;
        background-color: #3498db;
        border-radius: 50%;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loading;
