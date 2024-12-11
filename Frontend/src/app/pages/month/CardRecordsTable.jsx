'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave } from 'react-icons/fa'; // Icons for edit/save
import { MdPhone } from 'react-icons/md'; // Icons for phone
import Navbar from "@/app/global_Component/navbar" // Assuming you have a Navbar component
import Link from 'next/link';
import Loading from '@/app/global_Component/Loding';
import ErrorMessage from '@/app/global_Component/Error';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const colorPalette = [
  'bg-red-100', 
  'bg-yellow-100', 
  'bg-green-100', 
  'bg-blue-100', 
  'bg-indigo-100', 
  'bg-purple-100', 
  'bg-pink-100'
];

const RecordsTable = ({ tableName }) => {
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const [requireEditingMonth, setRequireEditingMonth] = useState(null);

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



    const storedSearch = localStorage.getItem("homePageToSpecificRoomSearch");
    if (storedSearch) {
      setSearchQuery(storedSearch);
    }


    
    const fetchRequireEditingMonth = async () => {
     
  
      




      try {
        const response = await axios.get('http://localhost:8081/require_editing_month', authConfig);
        setRequireEditingMonth(response.data.require_editing_month);
      } catch (err) {
        toast.error('Failed to fetch require_editing_month:',{autoClose:5000});
      }
    };

    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/CurrentMonthRecords/${tableName}`,authConfig);
        setRecords(response.data.data);
        setFilteredRecords(response.data.data);
      } catch (err) {
        setError(err.response ? err.response.data.error : 'Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    fetchRequireEditingMonth();
    fetchRecords();
  }, [tableName]);

  useEffect(() => {
    const filtered = records.filter(record =>
      record.NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.ROOM_NO.toString().includes(searchQuery) ||
      record.MOBILE_NO.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.METER_NO.toLowerCase().includes(searchQuery.toLowerCase()) 
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const handleEditClick = (roomNo, field) => {
    setEditableFields((prev) => ({
      ...prev,
      [roomNo]: { ...prev[roomNo], [field]: records.find(rec => rec.ROOM_NO === roomNo)[field] },
    }));
    setCurrentlyEditing({ roomNo, field });
  };

  const handleSaveClick = async (roomNo, field) => {
    const updatedRecord = { ...records.find(record => record.ROOM_NO === roomNo), ...editableFields[roomNo] };

    const updatedSubtotal = updatedRecord.ROOM_RENT + updatedRecord.WATER_BILL + updatedRecord.ELECTRICITY_BILL;
    const updatedTotal = updatedSubtotal + updatedRecord.PREVIOUS_DUE;
    const updatedDue = updatedTotal - updatedRecord.PAY;

    try {
      await axios.put('http://localhost:8081/updateRecord', {
        tableName,
        ROOM_NO: updatedRecord.ROOM_NO,
        ELECTRICITY_BILL: updatedRecord.ELECTRICITY_BILL,
        PAY: updatedRecord.PAY,
      },authConfig);

      await axios.put('http://localhost:8081/api/rooms', {
        ROOM_NO: updatedRecord.ROOM_NO,
        DUE: updatedDue,
      },authConfig);

      const updatedRecords = records.map((record) =>
        record.ROOM_NO === roomNo
          ? { ...updatedRecord, SUBTOTAL: updatedSubtotal, TOTAL: updatedTotal, DUE: updatedDue }
          : record
      );
      setRecords(updatedRecords);
      setEditableFields((prev) => ({ ...prev, [roomNo]: {} }));
      setCurrentlyEditing(null);

      // Sending email if the field updated is Electricity Bill or Pay
      if (field === 'ELECTRICITY_BILL') {
        await axios.post('http://localhost:8081/dueSendMail', {
          email: updatedRecord.E_MAIL,
          monthName: updatedRecord.MONTH_NAME,
          name: updatedRecord.NAME,
          roomNo : updatedRecord.ROOM_NO,
          meterNo: updatedRecord.METER_NO,
          roomBill: updatedRecord.ROOM_RENT,
          waterBill: updatedRecord.WATER_BILL,
          electricityBill: updatedRecord.ELECTRICITY_BILL,
          subTotal: updatedRecord.SUBTOTAL,
          previousDue: updatedRecord.PREVIOUS_DUE,
          total: updatedTotal,
          pay : updatedRecord.PAY,
          due : updatedDue 
        },authConfig);
        toast.success('Electricity bill email sent successfully!',{autoClose:3000});
      } else if (field === 'PAY') {
        await axios.post('http://localhost:8081/paySendMail', {
          monthName : updatedRecord.MONTH_NAME,
          name: updatedRecord.NAME,
          email: updatedRecord.E_MAIL,
          roomNo : updatedRecord.ROOM_NO,
          meterNo: updatedRecord.METER_NO,
          total : updatedTotal,
          pay : updatedRecord.PAY,
          due : updatedDue 
        },authConfig);
        toast.success('Pay email sent successfully!',{
          autoClose:3000,
          style: { backgroundColor: '#792AC2',color: '#ffffff' }
         });
      }

    } catch (err) {
      toast.error('Error updating record',{autoClose:5000});
    }
  };

  const handleFieldChange = (e, roomNo, field) => {
    const value = Number(e.target.value);
    setEditableFields((prev) => ({
      ...prev,
      [roomNo]: { ...prev[roomNo], [field]: value },
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    localStorage.setItem("homePageToSpecificRoomSearch", value);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage />;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-500 to-purple-500">
      <ToastContainer position="top-center" />
      <Navbar />
      <div className="fixed top-[70px] left-0 w-full z-10 p-2 mb-4 bg-white shadow-lg">
        <input
          type="text"
          placeholder="Search by Name or Room No"
          className="w-full p-1 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-[100px]">
        {filteredRecords.map((record) => {
          const colorClass = colorPalette[record.ROOM_NO % colorPalette.length];
          const roomNo = record.ROOM_NO; // Unique room number identifier

          return (
            <div key={roomNo} className={`relative p-6 transition-transform transform shadow-lg ${colorClass} rounded-xl hover:shadow-2xl hover:scale-105 hover:opacity-90`}>
              
              <h3 className="mb-4 text-2xl font-bold text-center text-gray-800 uppercase">{record.MONTH_NAME.slice(6)}</h3>

              <div className="space-y-2">
                {/* Remaining record display sections */}

                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-white' : 'bg-gray-100'} rounded-lg`}>
                  <p className="flex justify-between text-[20px] text-gray-700">
                    <strong className="font-bold">Room No:</strong> 
                    <span className="font-semibold">{record.ROOM_NO}</span>
                  </p>
                </div>
                
                {/* Name */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-gray-100' : 'bg-white'} rounded-lg`}>
                  <p className="flex justify-between text-[20px] text-gray-700">
                    <strong className="font-bold">Name:</strong> 
                    <span className="font-semibold">{record.NAME}</span>
                  </p>
                </div>
                
                {/* Mobile No */}
                {/* <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-white' : 'bg-gray-100'} rounded-lg flex items-center space-x-2 text-[20px]`}>
                  <MdPhone className="text-gray-600" />
                  <span className="font-semibold">{record.MOBILE_NO}</span>
                </div> */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-gray-100' : 'bg-white'} rounded-lg`}>
                  <p className="flex justify-between text-[20px] text-gray-700">
                    <strong className="font-bold">Meter No:</strong> 
                    <span className="font-bold text-[22px]">{record.METER_NO}</span>
                  </p>
                </div>
                {/* Electricity Bill (Editable) */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-gray-100' : 'bg-white'} rounded-lg flex justify-between items-center space-x-2`}>
                  <p className="text-[20px]"><strong className="font-bold">Electricity :</strong></p>
                  {editableFields[roomNo] && editableFields[roomNo].ELECTRICITY_BILL !== undefined ? (
                    <input
                      type="number"
                      value={editableFields[roomNo].ELECTRICITY_BILL}
                      onChange={(e) => handleFieldChange(e, roomNo, 'ELECTRICITY_BILL')}
                      className="px-1 py-1 border w-[90px] border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-[22px] font-bold"
                    />
                  ) : (
                    <span className="font-semibold text-[22px] ">{record.ELECTRICITY_BILL}</span>
                  )}
                  {requireEditingMonth === tableName && (
                    editableFields[roomNo] && editableFields[roomNo].ELECTRICITY_BILL !== undefined ? (
                      <button
                        onClick={() => handleSaveClick(roomNo, 'ELECTRICITY_BILL')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaSave className='text-[20px]'/>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(roomNo, 'ELECTRICITY_BILL')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={currentlyEditing && (currentlyEditing.roomNo !== roomNo || currentlyEditing.field !== 'ELECTRICITY_BILL')}
                      >
                        <FaEdit className='text-[20px]'/>
                      </button>
                    )
                  )}
                </div>

                {/* Subtotal */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-gray-100' : 'bg-white'} rounded-lg flex justify-between text-[20px]`}>
                  <strong className="font-bold">Subtotal:</strong> 
                  <span className="font-semibold">{record.SUBTOTAL}</span>
                </div>

                {/* Previous Due */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-white' : 'bg-gray-100'} rounded-lg flex justify-between text-[20px]`}>
                  <strong className="font-bold">Prev Due:</strong> 
                  <span className="font-semibold">{record.PREVIOUS_DUE}</span>
                </div>

                {/* Total */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-gray-100' : 'bg-white'} rounded-lg flex justify-between text-[20px]`}>
                  <strong className="font-bold">Total:</strong> 
                  <span className="font-semibold">{record.TOTAL}</span>
                </div>

                {/* Pay (Editable) */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-white' : 'bg-gray-100'} rounded-lg flex justify-between items-center space-x-2`}>
                  <p className="text-[20px]"><strong className="font-bold">Pay:</strong></p>
                  {editableFields[roomNo] && editableFields[roomNo].PAY !== undefined ? (
                    <input
                      type="number"
                      value={editableFields[roomNo].PAY}
                      onChange={(e) => handleFieldChange(e, roomNo, 'PAY')}
                      className="px-1 py-1 w-[100px] border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-[22px] font-bold"
                    />
                  ) : (
                    <span className="font-semibold text-[22px] ">{record.PAY}</span>
                  )}
                  {requireEditingMonth === tableName && (
                    editableFields[roomNo] && editableFields[roomNo].PAY !== undefined ? (
                      <button
                        onClick={() => handleSaveClick(roomNo, 'PAY')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaSave  className='text-[20px]'/>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(roomNo, 'PAY')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={currentlyEditing && (currentlyEditing.roomNo !== roomNo || currentlyEditing.field !== 'PAY')}
                      >
                        <FaEdit  className='text-[20px]'/>
                      </button>
                    )
                  )}
                </div>

                {/* Due */}
                <div className={`p-2 ${roomNo % 2 === 0 ? 'bg-white' : 'bg-gray-100'} rounded-lg flex justify-between text-[20px]`}>
                  <strong className="font-bold text-red-600">Due:</strong> 
                  <span className="font-bold text-red-600">{record.DUE}</span>
                </div>

                
                {/* Additional fields remain the same */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecordsTable;
