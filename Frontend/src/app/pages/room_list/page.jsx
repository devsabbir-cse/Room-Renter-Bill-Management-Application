"use client"
import React, { useState,useEffect } from 'react';
import Card from "./card"
import Table from "./table"
import Navbar from "@/app/global_Component/navbar"
import Loading from '@/app/global_Component/Loding';

const Page = () => {
  const [tableName, setTableName] = useState(''); // Initialize with an empty string or default value
  const [viewMode, setViewMode] = useState('card'); // Track the current view mode

  useEffect(() => {
    const storedTableName = localStorage.getItem('selectedMonth');
    if (storedTableName) {
      setTableName(storedTableName); // If a value exists in localStorage, use it
    }
  }, []);

  const handleViewToggle = (mode) => {
    setViewMode(mode); // Update view mode when the user toggles between Card and Table
  };

  return (
    <div className="w-full h-full px-5 mx-auto overflow-y-auto bg-gradient-to-r from-blue-500 to-purple-500">
      <Navbar className=""/>
      <div className="h-screen bg-gradient-to-r from-blue-500 to-purple-500">
  <div className="fixed z-30 p-4 transform top-[60px] right-[130px]">
    <div className="absolute flex overflow-hidden border-2 rounded-full">
      <button
        onClick={() => handleViewToggle('card')}
        className={`px-4 py-2 focus:outline-none ${
          viewMode === 'card' ? 'bg-blue-700 text-white' : 'bg-white text-blue-500'
        }`}
      >
        Card
      </button>
      <button
        onClick={() => handleViewToggle('table')}
        className={`px-4 py-2 focus:outline-none ${
          viewMode === 'table' ? 'bg-blue-700 text-white' : 'bg-white text-blue-500'
        }`}
      >
        Table
      </button>
    </div>
  </div>
  {tableName ? (
    viewMode === 'card' ? (
      <Card/>
    ) : (
      <Table/>
    )
  ) : (
    <Loading />
  )}
      </div>
    </div>
  );
};

export default Page;
