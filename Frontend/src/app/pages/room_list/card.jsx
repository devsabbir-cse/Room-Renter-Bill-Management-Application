'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Loading from '@/app/global_Component/Loding';
import Error from '@/app/global_Component/Error';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';


const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteRoom, setDeleteRoom] = useState(null); // Room to delete
  const [deleteInput, setDeleteInput] = useState(""); // Input for confirming delete
  const [updateInput, setUpdateInput] = useState(""); // Input for confirming update
  const [nidFront, setNidFront] = useState(null);
  const [formData, setFormData] = useState({
    ROOM_NO: '',
    NAME: '',
    METER_NO: '',
    MOBILE_NO: '',
    E_MAIL: '',
    ADDRESS: '',
    ROOM_RENT: '',
    WATER_BILL: '',
    DUE: '',
    NID_FRONT : null
  }); // Data for update form

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


  // File input change handler

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file size (200kB = 100 * 1024 bytes)
    if (file && file.size > 100 * 1024) {
      toast.error('File size exceeds 200KB. Please choose a smaller file.',{
        autoClose: 10000
      })
      setNidFront(null); // Reset the file input
    } else {
      setNidFront(file); // Store the file if it's valid
      
    }
    
    
  };

  

  
  // Fetch room data on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/rooms',authConfig);
        setRooms(response.data);
        setFilteredRooms(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Open update confirmation modal
  const handleUpdate = (room) => {
    setSelectedRoom(room);
    setUpdateInput(""); // Reset input for update confirmation
  };

  // Confirm update action
  const handleConfirmUpdate = () => {
    if (updateInput === `update${selectedRoom.ROOM_NO}`) {
      setFormData({
        ROOM_NO: selectedRoom.ROOM_NO,
        NAME: selectedRoom.NAME,
        METER_NO: selectedRoom.METER_NO,
        MOBILE_NO: selectedRoom.MOBILE_NO,
        E_MAIL: selectedRoom.E_MAIL,
        ADDRESS: selectedRoom.ADDRESS,
        ROOM_RENT: selectedRoom.ROOM_RENT,
        WATER_BILL: selectedRoom.WATER_BILL,
        DUE: selectedRoom.DUE,
        NID_FRONT: selectedRoom.NID_FRONT
      });
      setUpdateInput(""); // Reset input after confirmation
    } else {
      toast.error(`Input does not match. Please enter 'update${selectedRoom.ROOM_NO}' correctly.`,{
        autoClose: 10000
      });
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {};

    // Only add fields with values to updatedData
    for (const key in formData) {
        if (formData[key]) {
            updatedData[key] = formData[key];
        }
    }

    // Append the image file if provided
    if (nidFront) {
        const formDataWithImage = new FormData();
        for (const key in updatedData) {
            formDataWithImage.append(key, updatedData[key]);
        }
        formDataWithImage.append("NID_FRONT", nidFront);

        try {
            await axios.put(`http://localhost:8081/api/rooms/${selectedRoom.ROOM_NO}`, formDataWithImage, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Room updated successfully',{autoClose: 2000});
            setSelectedRoom(null); // Close modal
            const response = await axios.get('http://localhost:8081/api/rooms',authConfig);
            setRooms(response.data);

            setTimeout(() => {
              window.location.reload();
          }, 2000); 
        } catch (err) {
          toast.error(`Failed to update room: ${err.message}`,{autoClose: 10000});
        }
    } else {
        try {
            await axios.put(`http://localhost:8081/api/rooms/${selectedRoom.ROOM_NO}`, updatedData,authConfig);
            toast.success('Room updated successfully',{autoClose: 2000});
            setSelectedRoom(null); // Close modal
            const response = await axios.get('http://localhost:8081/api/rooms',authConfig);
            setRooms(response.data);
            setTimeout(() => {
              window.location.reload();
          }, 2000); 
        } catch (err) {
          toast.error(`Failed to update room`,{autoClose: 10000});
        }
    }
};


  // Open delete confirmation modal
  const handleDeleteClick = (room) => {
    setDeleteRoom(room);
    setDeleteInput(""); // Reset input for delete confirmation
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (deleteInput === `delete${deleteRoom.ROOM_NO}`) {
      try {
        await axios.delete(`http://localhost:8081/api/rooms/${deleteRoom.ROOM_NO}`,authConfig);
        toast.success('Room deleted successfully',{autoClose: 3000});
        // Refresh the room list after deletion
        const response = await axios.get('http://localhost:8081/api/rooms',authConfig);
        setRooms(response.data);
        setDeleteRoom(null); // Close delete modal

        setTimeout(() => {
          window.location.reload();
      }, 2000); 
      } catch (err) {
        toast.error(`Failed to delete room: ${err.message}`,{autoClose: 10000});
      }
    } else {
      toast.error(`Input does not match. Please enter 'delete${room_no}' correctly.`,{autoClose: 10000});
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cancel updating
  const handleCancel = () => {
    setSelectedRoom(null); // Close modal
  };

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

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl pt-[150px] ">
      <ToastContainer position="top-center" />
      <div className="fixed top-[70px] w-full left-0  z-10 p-2 mb-2 bg-white shadow-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Room No, Name, Meter No, or Mobile No"
          className="w-full px-4 py-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
        />
      </div>
      
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <li
            key={room.ROOM_NO}
            className="p-6 transition duration-500 transform bg-white shadow-lg rounded-xl hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative h-48 mb-6 overflow-hidden rounded-t-xl">
              <Image
                src={`data:image/jpeg;base64,${room.NID_FRONT}`}
                alt="NID Front"
                layout="fill"
                objectFit="cover"
                className="rounded-t-xl"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-4 text-2xl font-bold text-gray-800 ">{room.ROOM_NO}</h3>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-red-100 rounded">
                <p>NAME:</p>
                <span className="font-medium text-gray-700 uppercase">{room.NAME}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-blue-100 rounded">
                <p>Meter Number:</p>
                <span className="font-medium text-gray-700">{room.METER_NO}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-green-100 rounded">
                <p>Mobile No:</p>
                <span className="font-medium text-gray-700">{room.MOBILE_NO}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-yellow-100 rounded">
                <p>Email:</p>
                <span className="font-medium text-gray-700">{room.E_MAIL}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-purple-100 rounded">
                <p>Address:</p>
                <span className="font-medium text-gray-700">{room.ADDRESS}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-pink-100 rounded">
                <p>Room Rent:</p>
                <span className="font-medium text-gray-700">${room.ROOM_RENT}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-indigo-100 rounded">
                <p>Water Bill:</p>
                <span className="font-medium text-gray-700">${room.WATER_BILL}</span>
              </div>
              <div className="flex justify-between p-2 mb-2 text-gray-600 bg-red-300 rounded">
                <p>DUE:</p>
                <span className="font-medium text-gray-700">${room.DUE}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => handleUpdate(room)}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteClick(room)}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for confirming update action */}
      {selectedRoom && !formData.NAME && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Confirm Update Room {selectedRoom.ROOM_NO}</h2>
            <p>Please type "update{selectedRoom.ROOM_NO}" to confirm.</p>
            <input
              type="text"
              value={updateInput}
              onChange={(e) => setUpdateInput(e.target.value)}
              className="w-full px-3 py-2 mt-4 border rounded-md"
              placeholder={`update${selectedRoom.ROOM_NO}`}
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={handleConfirmUpdate}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Confirm Update
              </button>
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for updating room */}
      {selectedRoom && formData.NAME && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Update Room {selectedRoom.ROOM_NO}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="NAME"
                  value={formData.NAME}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Meter Number</label>
                <input
                  type="text"
                  name="METER_NO"
                  value={formData.METER_NO}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="MOBILE_NO"
                  value={formData.MOBILE_NO}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="E_MAIL"
                  value={formData.E_MAIL}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="ADDRESS"
                  value={formData.ADDRESS}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Room Rent</label>
                <input
                  type="number"
                  name="ROOM_RENT"
                  value={formData.ROOM_RENT}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Water Bill</label>
                <input
                  type="number"
                  name="WATER_BILL"
                  value={formData.WATER_BILL}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">DUE</label>
                <input
                  type="number"
                  name="DUE"
                  value={formData.DUE}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">NID_FRONT</label>
                <input
                  type="file"
                  name="NID_FRONT"
                  onChange={handleFileChange}
                  
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for confirming delete action */}
      {deleteRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">Delete Room {deleteRoom.ROOM_NO}</h2>
            <p>Please type "delete{deleteRoom.ROOM_NO}" to confirm.</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full px-3 py-2 mt-4 border rounded-md"
              placeholder={`delete${deleteRoom.ROOM_NO}`}
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteRoom(null)}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;


