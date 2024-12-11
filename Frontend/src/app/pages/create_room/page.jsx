'use client';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Navbar from "@/app/global_Component/navbar"


export default function CreateRoom() {
  const [formData, setFormData] = useState({
    roomNo: '',
    meterNo: '',
    name: '',
    mobileNo: '',
    email: '',
    address: '',
    roomRent: '',
    waterBill: '',
    due: '',
  });
  const [nidFront, setNidFront] = useState(null); // To hold the NID image
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress

  const router = useRouter(); // Initialize the router

  const Atoken = sessionStorage.getItem('token');

  if (!Atoken) {
    router.push('/');    
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file size (100kb = 100 * 1024 bytes)
    if (file && file.size > 100 * 1024) {
      toast.error('File size exceeds 100KB. Please choose a smaller file.', {
        position: 'top-center',
        autoClose: false
      });
      setNidFront(null); // Reset the file input
    } else {
      setNidFront(file); // Store the file if it's valid
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    

    

    const data = new FormData();
    data.append('ROOM_NO', formData.roomNo);
    data.append('METER_NO', formData.meterNo);
    data.append('NAME', formData.name);
    data.append('MOBILE_NO', formData.mobileNo);
    data.append('E_MAIL', formData.email);
    data.append('ADDRESS', formData.address);
    data.append('ROOM_RENT', formData.roomRent);
    data.append('WATER_BILL', formData.waterBill);
    data.append('DUE', formData.due);
    data.append('NID_FRONT', nidFront); // Append the file

    try {
      const xhr = new XMLHttpRequest();

      // Progress event listener for real-time updates
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentCompleted); // Set the upload progress
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          toast.success(response.message, {
            position: 'top-center',
          });
          // Set a timeout before navigating
          setTimeout(() => {
            router.push('./room_list'); // Navigate to the room list page after a delay
        }, 3000); // Delay of 3000 milliseconds (2 seconds)
        } else {
          toast.error(response.message, {
            position: 'top-center',
          });
        }
      };

      xhr.onerror = () => {
        toast.error('An error occurred during upload. Please try again.', {
          position: 'top-center',
        });
      };

      const token = sessionStorage.getItem('token');

      xhr.open('POST', 'http://localhost:8081/api/create-room');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(data); // Send form data with the file

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.', {
        position: 'top-center',
      });
    }


    if (!nidFront) {
      toast.error('Please upload a valid NID image.', {
        position: 'top-center',
      });
      return;
    }
  };

  return (

    <div className='p-6 bg-gradient-to-r from-blue-500 to-purple-500'>
      <ToastContainer position="top-center" />
      <Navbar/>
      <div className="flex items-center justify-center min-h-screen pt-[50px]">
        
        <form onSubmit={handleSubmit} className="max-w-lg p-8 space-y-6 transition-transform duration-300 ease-in-out transform bg-white rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Create a New Room</h2>
          <div>
            <label className="block font-medium text-gray-700 text-[20px]">Room No</label>
            <input name="roomNo" type="text" placeholder="Room No" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-[22px] font-bold text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Meter No</label>
            <input name="meterNo" type="text" placeholder="Meter No" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Name</label>
            <input name="name" type="text" placeholder="Name" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Mobile No</label>
            <input name="mobileNo" type="number" placeholder="Mobile No" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Email</label>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Address</label>
            <textarea name="address" placeholder="Address" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold"></textarea>
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Room Rent</label>
            <input name="roomRent" type="number" placeholder="Room Rent" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Water Bill</label>
            <input name="waterBill" type="number" placeholder="Water Bill" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">Due</label>
            <input name="due" type="number" placeholder="Due" onChange={handleChange} className="block w-full px-4 py-3 mt-1 text-black border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-[22px] font-bold" />
          </div>
          <div>
            <label className="block text-[20px] font-medium text-gray-700">NID Front</label>
            <input name="nidFront" type="file" onChange={handleFileChange} className="block w-full px-4 py-2 mt-1 text-sm text-gray-500 border-0 rounded-full file:mr-4 file:py-2 file:px-4 file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200" />
          </div>

          {uploadProgress > 0 && (
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-right">
                  <span className="inline-block text-xs font-semibold text-blue-600">
                    Uploading: {uploadProgress}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 mb-4 bg-blue-200 rounded">
                <div style={{ width: `${uploadProgress}%` }} className="h-full text-center text-white bg-blue-500"></div>
              </div>
            </div>
          )}

          <div>
            <button type="submit" className="w-full px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:bg-gradient-to-l focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>

  );
}
