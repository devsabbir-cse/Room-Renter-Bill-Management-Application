'use client';
import React, { useEffect, useState } from 'react';
import logo from "@/public/logo.png";
import textLogo from "@/public/textLogo.png";
import bgImg from "@/public/bgImg.png";

import Image from 'next/image';

const UserPortal = () => {
  const [tables, setTables] = useState([]);
  const [roomNo, setRoomNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/');
  }

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const storedRoomNo = localStorage.getItem('userRoomNo');
    const storedMobileNo = localStorage.getItem('userMobileNo');
  
    if (storedRoomNo && storedMobileNo) {
      setRoomNo(storedRoomNo);
      setMobileNo(storedMobileNo);
    } else {
      setError('Room number or mobile number is not found in localStorage');
    }
  
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:8081/UserGetAllMonth', authConfig);
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        const filteredTables = data.filter((tableName) => tableName.startsWith('month_'));
  
        const tablesWithData = [];
  
        for (const table of filteredTables) {
          const res = await fetch(
            `http://localhost:8081/api/userGetRoomData?tableName=${table}&roomNo=${storedRoomNo}&mobileNo=${storedMobileNo}`,
            authConfig
          );
  
          if (res.ok) {
            const tableData = await res.json();
            if (tableData && tableData.length > 0) {
              tablesWithData.push(table);
            }
          }
        }
        console.log(tablesWithData,"tablesWithDatatablesWithData");
        
  
        setTables(tablesWithData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTables();
  }, []);
  
  const fetchDataFromTable = async (table) => {
    
    if (table && mobileNo && roomNo) {
      try {
        const response = await fetch(
          `http://localhost:8081/api/userGetRoomData?tableName=${table}&roomNo=${roomNo}&mobileNo=${mobileNo}`,
          authConfig
        );
        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.error || 'Failed to fetch data from the selected table');
        }
        const data = await response.json();
        setData(data);
        setError('')
      } catch (err) {
        setError(err.message);
        setData('')
      }
    } else {
      setError('Room number and mobile number are required');
    }
  };

  return (
<div
  className="w-full h-screen bg-cover bg-center flex items-center justify-center p-6 relative overflow-y-auto"
  style={{ backgroundImage: `url(${bgImg.src})` }}
>
  <div className="absolute inset-0 bg-black bg-opacity-70 z-0 h-screen w-full overflow-y-auto overflow-x-auto pt-5 px-2">
    
    <div className="flex justify-center pt-[10px] mb-[30px]">
          <div className="relative flex space-x-4 z-10">
            <Image src={logo} alt="logo" width={80} height={80} />
            <Image src={textLogo} alt="text logo" width={300} height={40} />
          </div>
    </div>
    
    <div className="flex justify-between items-center gap-5">

      <div className="w-full">
        <select
          onChange={(e) => {
            fetchDataFromTable(e.target.value);
          }}
          className="w-full px-4 py-3 bg-[#6B24AE] text-white rounded-md shadow-sm text-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 "
        >
          <option value="" className="text-gray-400  text-center ">Select a table</option>
          {tables.map((table, index) => (
            <option key={index} value={table} className="text-gray-100  text-center">
              {table.slice(6).toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <button className="bg-[#a86ce0] px-5 py-2 font-bold text-xl text-white rounded-md hover:bg-[#8f52c5] transition-all duration-300 shadow-lg" 
      onClick={()=>{ localStorage.removeItem("token");localStorage.removeItem("userRoomNo");localStorage.removeItem("userMobileNo"); window.location.href="/" }}  >
        Logout
      </button>
    </div>

  <div className="z-10 w-full space-y-6">

    <div className="relative bg-gray-800 bg-opacity-70 shadow-2xl rounded-lg p-3 mx-auto lg:w-[400px]   transition duration-500 hover:scale-101 hover:shadow-xl border border-gray-700 mt-3">
      {loading && <p className="text-[#6b24ae] text-center font-semibold animate-pulse text-lg">Loading tables...</p>}
      {error && <p className="text-red-500 text-center font-semibold text-lg">{error}</p>}

      {data ? (
        <div className="mt-6 space-y-4">
          {data.map((row, index) => (
            <div
              key={index}
              className="bg-gray-700 bg-opacity-60 p-5 rounded-lg shadow-md border border-gray-700 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#6b24ae]"
            >
              <div className="space-y-3 divide-y divide-gray-600">
                {[
                  { label: "Month", value: row.MONTH_NAME.slice(6).toUpperCase() },
                  { label: "Meter No", value: row.METER_NO },
                  { label: "Room No", value: row.ROOM_NO },
                  { label: "Name", value: row.NAME.toUpperCase() },
                  { label: "Mobile No", value: row.MOBILE_NO },
                  { label: "Email", value: row.E_MAIL },
                  { label: "Address", value: row.ADDRESS },
                  { label: "Room Rent", value: row.ROOM_RENT },
                  { label: "Water Bill", value: row.WATER_BILL },
                  { label: "Electricity Bill", value: row.ELECTRICITY_BILL },
                  { label: "Subtotal", value: row.SUBTOTAL },
                  { label: "Previous Due", value: row.PREVIOUS_DUE },
                  { label: "Total", value: row.TOTAL },
                  { label: "Pay", value: row.PAY , customClass: "text-green-400 font-semibold"},
                  { label: "Due", value: row.DUE , customClass: "text-red-400 font-bold"}
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 text-lg text-gray-200">
                    <span className="font-medium text-gray-100">{item.label}</span>
                    <span className={`${item.customClass || 'text-gray-300'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center text-lg">No data available</div>
      )}
    </div>
  </div>
  </div>
</div>




  );
};

export default UserPortal;
