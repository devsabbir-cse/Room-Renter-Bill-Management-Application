'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Navbar from "@/app/global_Component/navbar"

const Page = () => {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [buttonEnabled, setButtonEnabled] = useState(false);

  axios.defaults.withCredentials = true; // Enable credentials with requests
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  
  if (!token) {
    router.push('/');    
  }

  const getMonthName = (monthNumber) => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return months[parseInt(monthNumber, 10) - 1];
  };

  useEffect(() => {
    const fetchDateTime = async () => {
      try {
        const response = await fetch('https://api.timezonedb.com/v2.1/get-time-zone?key=IP7NGBG12397&format=json&by=zone&zone=Asia/Dhaka');
        const data = await response.json();
        const dateTime = data.formatted;

        const monthNumber = dateTime.slice(5, 7); // Month as a number (01-12)
        const year = dateTime.slice(0, 4);        // Year

        const monthName = getMonthName(monthNumber);

        setMonth(monthName);
        setYear(year);
        // setTableName(`month_${monthName}${year}`); // dynamic table name based on current month and year
        setTableName(`month_january2025`); // dynamic table name based on current month and year
      } catch (error) {
        toast.error('Error fetching date:', error);
        toast.error('Error fetching date and time. Please try again.', {
          autoClose: false, // Keep the error message until user closes it
        });
      }
    };

    fetchDateTime();
  }, []);



  
  
  const handleCreateTable = async () => {


    if (!token) {
      toast.error('No token found in session storage.');
      return;
    }

    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };



    try {
      // Step 1: Create the new table
      const response = await axios.post('http://localhost:8081/create_new_month', { tableName }, authConfig);
      toast.success(response.data.message, {
        autoClose: 4000, // Close after 3 seconds
      });

      // Step 2: Update require_editing column
      await axios.put('http://localhost:8081/update_require_editing', { require_editing_month: tableName },authConfig);
      toast.success('Table created successfully, and editing month updated.', {
        autoClose: 6000,
      });

      // Step 3: Fetch rooms data
      const roomsData = await axios.get('http://localhost:8081/api/rooms',authConfig);
      toast.success('Rooms data fetched successfully.', {
        autoClose: 8000,
      });

      // Step 4: Format the data
      const formattedData = roomsData.data.map((room) => {
        const subtotal = room.ROOM_RENT + room.WATER_BILL + 0; // ELECTRICITY_BILL is 0 by default
        const total = subtotal + room.DUE;
        const due = total - 0; // PAY is 0 by default

        return {
          MONTH_NAME: tableName,
          METER_NO: room.METER_NO,
          ROOM_NO: room.ROOM_NO,
          NAME: room.NAME,
          MOBILE_NO: room.MOBILE_NO,
          E_MAIL: room.E_MAIL,
          ADDRESS: room.ADDRESS,
          ROOM_RENT: room.ROOM_RENT,
          WATER_BILL: room.WATER_BILL,
          ELECTRICITY_BILL: 0,
          SUBTOTAL: subtotal,
          PREVIOUS_DUE: room.DUE,
          TOTAL: total,
          PAY: 0,
          DUE: due,
        };
      });

      // Step 5: Insert the formatted data into the newly created table
      const insertResponse = await axios.post('http://localhost:8081/insert_into_table', {
        tableName,
        data: formattedData,
      },authConfig);
      toast.success(insertResponse.data.message, {
        autoClose: 10000,
      });

      // Step 6: Update the 'DUE' in /api/rooms for each room
      const updateDuePromises = formattedData.map((room) => {
        return axios.put('http://localhost:8081/api/rooms', {
          ROOM_NO: room.ROOM_NO,
          DUE: room.DUE,
        },authConfig);
      });

      await Promise.all(updateDuePromises);
      toast.success('DUE values updated successfully for all rooms.', {
        autoClose: 3000,
      });

      localStorage.setItem('selectedMonth', tableName);

      // Set timeout to navigate after 10 seconds
      setTimeout(() => {
        router.push('/pages/month'); // Navigate to /pages/month after 10 seconds
      }, 9000); // 9 seconds delay

    } catch (error) {
      console.error('Error:', error);
      toast.error('Already This Month Created Or Somthing Wrong', {
        autoClose: false, // Keep error toast until user closes
      });
    }
  };

  // Countdown logic
  useEffect(() => {
    let timer;
    if (showPopup && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setButtonEnabled(true);
    }

    return () => clearTimeout(timer);
  }, [showPopup, countdown]);

  return (
    <div className="flex flex-col w-full min-h-screen px-5 pt-5 bg-gradient-to-r from-blue-500 to-purple-500">
      <Navbar />
      <div className="flex flex-col items-center justify-center w-full h-screen text-black">
        <div className="p-8 text-center text-gray-800 bg-white rounded-lg shadow-lg w-[90%] max-w-sm">
          <p className="mb-6 text-xl font-bold">
            <span className="uppercase">{month} {year}</span>
          </p>
          <button
            onClick={() => {
              setShowPopup(true);
              setCountdown(25);
              setButtonEnabled(false);
            }}
            className="px-6 py-3 text-white transition-all duration-200 ease-out transform rounded-md shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl hover:scale-105 active:scale-95 font-semibold text-[22px]"
          >
            Create Table
          </button>
        </div>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-8 text-center bg-white rounded-lg shadow-2xl max-w-sm w-[90%]">
              <p className="mb-2 text-gray-800 text-red-600 text-[22px] font-medium">
                ১। রুমের ডাটা আপডেট অথবা নতুন রুম খুলতে হলে ,আগে সেটি করে আসুন।<br /><br />
                ২। আগের মাসের সব ডাঁটা তুলেছেন ? যদি তুলে থাকেন তাহলে YES চাপুন
                
              </p>
              <strong className='uppercase text-[26px] font-bold'> নতুন মাস :  {tableName.slice(6, )}</strong>
              <div className="flex justify-center mt-3 space-x-4">
                <button
                  onClick={() => {
                    handleCreateTable();
                    setShowPopup(false);
                  }}
                  disabled={!buttonEnabled}
                  className={`px-6 py-3 text-white transition-all duration-200 ease-out transform rounded-md shadow-lg ${
                    buttonEnabled
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-xl hover:scale-105 active:scale-95'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {buttonEnabled ? 'Yes' : countdown}
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-3 text-white transition-all duration-200 ease-out transform rounded-md shadow-lg bg-gradient-to-r from-red-500 to-red-700 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" />
      </div>
    </div>

  );
};

export default Page;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMzQsImlhdCI6MTczMTM1MTUxOCwiZXhwIjoxNzMxMzU1MTE4fQ.2XOBQ3DJ2KCyL_4kZlrjrpix5gXyE5cZ3QqK5wEhsTw

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMzQsImlhdCI6MTczMTM1MTU2MywiZXhwIjoxNzMxMzU1MTYzfQ.9aYY2lXtrnxjgv7n5m12jyDPuPPgJgHfO9dCn0bWJaU