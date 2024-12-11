'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/app/global_Component/navbar"
import Loading from '@/app/global_Component/Loding';
import ErrorMessage from '@/app/global_Component/Error';

const MonthTableList = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  
  const token = sessionStorage.getItem('token');

  if (!token) {
    router.push('/');    
  }


  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:8081/getAllMonth',authConfig);
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        console.log(data);
        
        const sortedTables = sortTables(data);
        setTables(sortedTables);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  const sortTables = (data) => {
    return data.sort((a, b) => {
      // Extract month and year from the table name
      const dateA = extractDateFromString(a);
      const dateB = extractDateFromString(b);
      return dateB - dateA; // Sort in descending order
    });
  };

  const extractDateFromString = (tableName) => {
    // Extract the month and year from the table name like "month_april2024"
    const parts = tableName.split('_');
    const monthStr = parts[1].replace(/[0-9]/g, '');  // Get the month name (e.g., "april")
    const yearStr = parts[1].replace(/[a-zA-Z]/g, ''); 
    
    const monthIndex = getMonthIndex(monthStr); // Convert month name to month index
    const year = parseInt(yearStr);
    return new Date(year, monthIndex); // Create a Date object for the first day of that month
  };

  const getMonthIndex = (monthStr) => {
    const months = [
      "january", "february", "march", "april", "may", "june", 
      "july", "august", "september", "october", "november", "december"
    ];
    return months.indexOf(monthStr.toLowerCase()); // Return the corresponding month index
  };

  const handleTableClick = (tableName) => {
    localStorage.setItem('selectedMonth', tableName);
    localStorage.setItem('homePageToSpecificRoomSearch', '');
    
    router.push('/pages/month');
    console.log(`Table ${tableName} clicked and stored in local storage.`);
  };

  if (loading) {
    return <Loading/>;
  }

  if (error) {
    return <ErrorMessage></ErrorMessage>;
  }

  return (
    <div className="w-full h-screen p-6 py-10 pt-[80px] mx-auto bg-gradient-to-r from-blue-500 to-purple-500 overflow-y-auto overflow-x-hidden">
  <Navbar />
  <h2 className="mt-3 mb-8 text-4xl font-bold tracking-wider text-center text-gray-100 ">
    ALL MONTH
  </h2>
  <ul className="grid grid-cols-1 gap-8 overflow-x-hidden overflow-y-hidden sm:grid-cols-2 lg:grid-cols-3">
    {tables.map((tableName, index) => (
      <li
        key={index}
        onClick={() => handleTableClick(tableName)}
        className="relative p-6 text-center transition-transform duration-300 transform bg-white rounded-lg shadow-lg cursor-pointer hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-br from-purple-500 to-blue-500"
      >
        <span className="block mb-2 text-3xl font-bold tracking-wide text-transparent uppercase bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
          {tableName.slice(6)}
        </span>
      </li>
    ))}
  </ul>
    </div>

  );
};

export default MonthTableList;
