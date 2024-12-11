'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "@/app/global_Component/navbar";
import { useRouter } from 'next/navigation';
import Loading from '@/app/global_Component/Loding';
import Error from '@/app/global_Component/Error';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Page = () => {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requireEditingMonth, setRequireEditingMonth] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  // Function to retrieve token from sessionStorage
  const getToken = () => {
    return sessionStorage.getItem('token'); // Adjust key name if needed
  };

  
  if (!getToken) {
    router.push('/');    
  }

  useEffect(() => {



    const fetchRequireEditingMonth = async () => {
      try {
        const token = getToken();
        
        const response = await axios.get('http://localhost:8081/require_editing_month', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequireEditingMonth(response.data.require_editing_month);
      } catch (err) {
        toast.error('Failed to fetch require_editing_month',{autoClose: false});
        router.push('/');
        setError('Failed to fetch required editing month.');
      }
    };

    fetchRequireEditingMonth();
  }, []);

  useEffect(() => {
    if (requireEditingMonth) {
      const fetchRecords = async () => {
        try {
          setLoading(true);
          const token = getToken();
          const response = await axios.get(`http://localhost:8081/CurrentMonthRecords/${requireEditingMonth}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setRecords(response.data.data);
          setFilteredRecords(response.data.data);
        } catch (err) {
          toast.error('Failed to fetch records:', {autoClose: false});
          router.push('/');
          setError('Failed to fetch records.');
        } finally {
          setLoading(false);
        }
      };

      fetchRecords();
    }
  }, [requireEditingMonth]);

  useEffect(() => {
    const filtered = records.filter((record) => {
      const roomNo = record.ROOM_NO.toString().includes(searchQuery);
      const name = record.NAME.toLowerCase().includes(searchQuery.toLowerCase());
      const meterNo = record.METER_NO.toLowerCase().includes(searchQuery.toLowerCase());
      const mobileNo = record.MOBILE_NO.toLowerCase().includes(searchQuery.toLowerCase());
      return name || roomNo || mobileNo || meterNo;
    });
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  // const handleSaveName = (name) => {
  //   localStorage.setItem('homePageToSpecificRoomSearch', name);
  //   router.push('/pages/month');
  // };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  if (records.length === 0) {
    return <div className="text-center text-gray-600 text-[22px]">No records found for the selected month.</div>;
  }

  return (
    <div className="relative w-full h-screen p-6 mx-auto overflow-x-auto bg-gradient-to-r from-blue-500 to-purple-500 pt-[150px] overflow-y-auto">
      
      <ToastContainer position="top-center" />
      <div><Navbar /></div>
      <div className="fixed z-10 w-[100%] px-4 py-2 bg-white shadow-md top-[72px] left-0">
        <input
          type="text"
          placeholder="Search"
          className="border text-[24px] placeholder:text-[26px] rounded px-4 py-2 w-full placeholder-gray-700 text-black font-semibold"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full shadow-lg sm:rounded-lg">
        <table className="min-w-full text-[24px] text-left text-gray-800 bg-white">
          <thead className="text-[22px] font-bold text-gray-900 uppercase bg-blue-100">
            <tr className="transition duration-300 ease-in-out transform hover:scale-[1.01]">
              <th scope="col" className="px-2 py-4">Name</th>
              <th scope="col" className="px-2 py-4">Amount</th>
              <th scope="col" className="px-2 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr
                key={index}
                className={`border border-gray-300 ${
                  index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                } transition duration-220 ease-in-out transform hover:scale-[1.01] hover:bg-gray-200`}
              >
                <td className="px-2 py-2 text-[20px] font-md font-semibold">{record.NAME}</td>
                <td className="px-2 py-2 text-[20px] font-semibold">{record.DUE}</td>
                <td className="px-2 py-2 text-center">
                  {record.DUE > 0 ? (
                    <button className="inline-flex items-center px-2 py-1 text-[18px] font-medium text-white bg-red-500 rounded-lg focus:ring-4 focus:ring-blue-300 transform transition">
                      DUE
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-[18px] font-medium text-white bg-green-500 rounded-lg focus:ring-4 focus:ring-blue-300 transform transition">
                      Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;


