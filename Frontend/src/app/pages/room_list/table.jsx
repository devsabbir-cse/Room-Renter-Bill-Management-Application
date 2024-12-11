'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import ErrorMessage from '@/app/global_Component/Error';
import Loading from '@/app/global_Component/Loding';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]); // To store filtered rooms
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
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
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/rooms',authConfig); // Update URL accordingly
        setRooms(response.data);
        setFilteredRooms(response.data); // Set initial filtered rooms
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Function to handle search filtering
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = rooms.filter(room => 
      room.ROOM_NO.toString().includes(query) || 
      room.NAME.toLowerCase().includes(query) || 
      room.METER_NO.toString().includes(query) || 
      room.MOBILE_NO.toString().includes(query)
    );
    
    setFilteredRooms(filtered); // Update the filtered rooms
  };

  if (loading) return <Loading/>;
  if (error) return <ErrorMessage/>;

  return (
    <div className="px-4 py-8 mx-auto overflow-y-auto max-w-7xl pt-[150px] overflow-x-auto">
      <ToastContainer position="top-center" />

      {/* Search bar */}
      <div className="fixed top-[70px] w-full left-0  z-10 p-2 mb-4 bg-white shadow-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Room No, Name, Meter No, or Mobile No"
          className="w-full px-4 py-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto overflow-y-auto">
        <table className="w-full bg-white border border-collapse border-gray-300 table-auto">
          <thead>
            <tr className="text-left bg-indigo-100">
              <th className="px-2 py-4 text-base font-bold text-gray-800 border border-gray-300">Room No</th>
              <th className="px-2 py-4 text-base font-bold text-gray-800 border border-gray-300">Name</th>
              <th className="px-2 py-4 text-base font-bold text-gray-800 border border-gray-300">Meter No</th>
              <th className="px-2 py-4 text-base font-bold text-gray-800 border border-gray-300">Mobile No</th>
              <th className="px-2 py-4 text-base font-bold text-gray-800 border border-gray-300 ">Email</th>
              <th className="px-2 py-2 text-base font-bold text-gray-800 border border-gray-300">Address</th>
              <th className="px-2 py-2 text-base font-bold text-gray-800 border border-gray-300">Room Rent</th>
              <th className="px-2 py-2 text-base font-bold text-gray-800 border border-gray-300">Water Bill</th>
              <th className="px-2 py-2 text-base font-bold text-gray-800 border border-gray-300">NID Front</th>
            </tr>
          </thead>
          <tbody className='text-[20px]'>
            {filteredRooms.map((room, index) => (
              <tr key={room.ROOM_NO} className={index % 2 === 0 ? 'bg-green-100' : 'bg-orange-100'}>
                <td className="px-2 py-2 text-gray-900 border border-gray-300">{room.ROOM_NO}</td>
                <td className="sticky left-0 z-10 px-2 py-2 text-gray-900 border border-gray-300 text-[22px] font-bold ">{room.NAME}</td>
                <td className="px-2 py-2 text-gray-900 border border-gray-300 ">{room.METER_NO}</td>
                <td className="px-2 py-2 text-gray-900 border border-gray-300 ">{room.MOBILE_NO}</td>
                <td className="px-2 py-2 text-gray-900 border border-gray-300 ">{room.E_MAIL}</td>
                <td className="px-2 py-2 text-gray-700 border border-gray-300">{room.ADDRESS}</td>
                <td className="px-2 py-2 text-gray-900 border border-gray-300">${room.ROOM_RENT}</td>
                <td className="px-2 py-2 text-gray-700 border border-gray-300">${room.WATER_BILL}</td>
                <td className="px-2 py-2 border border-gray-300">
                  <Image
                    src={`data:image/jpeg;base64,${room.NID_FRONT}`}
                    alt="NID Front"
                    height={50}
                    width={50}
                    className="rounded-md"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomList;
