'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave } from 'react-icons/fa'; // Icons for edit/save
import Navbar from "@/app/global_Component/navbar"; // Assuming you have a Navbar component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const RecordsTable = ({ tableName }) => {
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editableFields, setEditableFields] = useState({});
    const [currentlyEditing, setCurrentlyEditing] = useState(null); // Tracks the currently edited record and field
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
        const fetchRequireEditingMonth = async () => {
          try {
            const response = await axios.get('http://localhost:8081/require_editing_month',authConfig);
            setRequireEditingMonth(response.data.require_editing_month);
          } catch (err) {
            toast.error('Failed to fetch require_editing_month',{autoClose:5000});
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
            toast.success('Electricity bill email sent successfully!' ,{autoClose:3000});
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
            toast.success('Pay email sent successfully!',{autoClose:3000});
          }
    
        } catch (err) {
          toast.error('Error updating record:',{autoClose:5000});
        }
      };
    
      const handleFieldChange = (e, roomNo, field) => {
        const value = Number(e.target.value);
        setEditableFields((prev) => ({
          ...prev,
          [roomNo]: { ...prev[roomNo], [field]: value },
        }));
      };
    if (loading) {
        return <div className="text-center text-gray-600">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="w-full h-screen p-6 bg-gradient-to-r from-blue-500 to-purple-500">
          <ToastContainer position="top-center" />
            {/* Add Navbar */}
            <Navbar />

            {/* Search Input */}
            <div className="fixed top-[70px] w-full left-0 z-10 p-2 mb-4 bg-white shadow-lg">
                <input
                    type="text"
                    placeholder="Search by Name or Room No"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update search query on change
                />
            </div>

            {/* Excel-like Table */}
            <div className='overflow-x-auto overflow-y-auto pt-[110px]'>
                <h1 className="flex justify-center py-3 font-bold bg-green-300 text-[22px] uppercase" >{tableName.slice(6, )}</h1>
                
                <table className="w-full border-collapse table-auto ">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Room No</th>
                            <th className="p-2 border">Mobile No</th>
                            <th className="p-2 border">Room Rent</th>
                            <th className="p-2 border">Water Bill</th>
                            <th className="p-2 border">Meter No</th>
                            <th className="p-2 border">Electricity Bill</th>
                            <th className="p-2 border">Subtotal</th>
                            <th className="p-2 border">Previous Due</th>
                            <th className="p-2 border">Total</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Pay</th>
                            <th className="p-2 border">Due</th>
                        </tr>
                    </thead>
                    <tbody className='text-[20px] font-medium'> 
                        {filteredRecords.map((record) => (
                            <tr key={ record.ROOM_NO} className={`text-gray-800 ${ record.ROOM_NO % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                                
                                <td className="p-2 text-center border">{record.ROOM_NO}</td>
                                <td className="p-2 text-center border">{record.MOBILE_NO}</td>
                                <td className="p-2 text-center border">{record.ROOM_RENT}</td>
                                <td className="p-2 text-center border">{record.WATER_BILL}</td>
                                <td className="p-2 text-center border">{record.METER_NO}</td>
                                <td className="p-2 text-center border">
                                    {editableFields[ record.ROOM_NO] && editableFields[ record.ROOM_NO].ELECTRICITY_BILL !== undefined ? (
                                        <input
                                            type="number"
                                            value={editableFields[ record.ROOM_NO].ELECTRICITY_BILL}
                                            onChange={(e) => handleFieldChange(e,  record.ROOM_NO, 'ELECTRICITY_BILL')}
                                            className="px-2 py-1 border border-gray-300 rounded w-[80px]"
                                        />
                                    ) : (
                                        record.ELECTRICITY_BILL
                                    )}
                                    {requireEditingMonth === tableName && (
                                        editableFields[ record.ROOM_NO] && editableFields[ record.ROOM_NO].ELECTRICITY_BILL !== undefined ? (
                                            <button
                                                onClick={() => handleSaveClick( record.ROOM_NO, 'ELECTRICITY_BILL')}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <FaSave  className='text-[20px]'/>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick( record.ROOM_NO, 'ELECTRICITY_BILL')}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                disabled={currentlyEditing && (currentlyEditing.roomNo  !==  record.ROOM_NO || currentlyEditing.field !== 'ELECTRICITY_BILL')} // Disable other buttons
                                            >
                                                <FaEdit className='text-[20px]'/>
                                            </button>
                                        )
                                    )}
                                </td>
                                <td className="p-2 text-center border">{record.SUBTOTAL}</td>
                                <td className="p-2 text-center border">{record.PREVIOUS_DUE}</td>
                                <td className="p-2 text-center border">{record.TOTAL}</td>
                                <td className="sticky left-0 right-0 z-20 p-2 font-bold capitalize border">{record.NAME}</td>
                                <td className="p-2 text-center border">
                                    {editableFields[ record.ROOM_NO] && editableFields[ record.ROOM_NO].PAY !== undefined ? (
                                        <input
                                            type="number"
                                            value={editableFields[ record.ROOM_NO].PAY}
                                            onChange={(e) => handleFieldChange(e,  record.ROOM_NO, 'PAY')}
                                            className=" px-2 py-1 border border-gray-300 rounded  w-[80px]"
                                        />
                                    ) : (
                                        record.PAY
                                    )}
                                    {requireEditingMonth === tableName && (
                                        editableFields[ record.ROOM_NO] && editableFields[ record.ROOM_NO].PAY !== undefined ? (
                                            <button
                                                onClick={() => handleSaveClick( record.ROOM_NO, 'PAY')}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <FaSave  className='text-[20px]'/>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick( record.ROOM_NO, 'PAY')}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                disabled={currentlyEditing && (currentlyEditing.roomNo  !==  record.ROOM_NO || currentlyEditing.field !== 'PAY')} // Disable other buttons
                                            >
                                                <FaEdit  className='text-[20px]'/>
                                            </button>
                                        )
                                    )}
                                </td>
                                <td className="p-2 font-semibold text-center text-red-600 border">{record.DUE}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecordsTable;
