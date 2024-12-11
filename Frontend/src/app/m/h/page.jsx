'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import logo from "@/public/logo.png";
import textLogo from "@/public/textLogo.png";
import bgImg from "@/public/bgImg.png";
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const date = new Date();
  const day = date.getDate();
  const monthName = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const [showSection, setShowSection] = useState(true);



  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(id == ""){
      toast.error("Please enter your ID",{autoClose: 3000});
    }
    if(password == ""){
      toast.error("Please enter your password",{autoClose: 3000});
    }



   



    


    try {
      const response = await axios.post('http://localhost:8081/auth', { id, password });
      toast.success('Login successful',{autoClose: 3000});
      sessionStorage.setItem('token', response.data.token);

      setTimeout(() => {
        router.push('/pages/home');      
      }, 3000);
      setId('')
      setPassword('')

    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred', {autoClose: 3000});
    }




    
  };

  return (
    <div 
      className="w-full h-screen bg-cover bg-center relative overflow-y-auto"
      style={{ backgroundImage: `url(${bgImg.src})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80 z-0 w-full h-screen overflow-y-auto">
      <ToastContainer position="top-center" />
        <div className="flex justify-center pt-[30px]">
          <div className="relative flex space-x-4 z-10">
            <Image src={logo} alt="logo" width={80} height={80} />
            <Image src={textLogo} alt="text logo" width={300} height={40} />
          </div>
        </div>
        <p className="font-bold text-white text-[22px] w-[350px] text-center mt-3 mx-auto">
          গোপালগঞ্জ ,পশ্চিম শিবরামপুর সদর , দিনাজপুর
        </p>

        {/* Display the date, month name, and year */}
        <p className="text-white text-center mt-5 text-[26px] font-black">
          {`${day} ${monthName} ${year}`}
        </p>

        {/* Toggle Buttons */}
        <div className="text-white gap-x-2 flex justify-center mt-10 ">
          <button
            onClick={() => setShowSection(true)}
            className={`px-[30px] py-1 ${showSection ? 'bg-[#6b24ae]' : 'bg-opacity-30'} bg-[#6b24ae] text-[20px] font-bold`}
          >
            Available Room
          </button>
          <button
            onClick={() => setShowSection(false)}
            className={`px-[50px] py-1 ${!showSection ? 'bg-[#6b24ae]' : 'bg-opacity-30'} bg-[#6b24ae] text-[20px] font-bold`}
          >
            Log In
          </button>
        </div>

        {/* Conditionally render sections */}
        <div className="w-[380px] h-auto bg-black bg-opacity-30 mt-3 mx-auto p-5 rounded-lg">
          {showSection ? (
            <div>
              <p className="bg-[#6b24ae] text-center text-white font-black text-[20px] py-2">Available Room</p>
              <p className ="text-red-500 text-center mt-2">It part's Under Developing ...</p>
            </div>
          ) : (
            <div>
              {/* Log In Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Enter Your Id "
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className=" text-[20px] w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-[#6b24ae]"
                />
                <input
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className=" text-[20px] w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-[#6b24ae]"
                />
                <button
                  type="submit"
                  className=" text-[24px] w-full py-2 mt-2 bg-[#6b24ae] text-white font-bold rounded hover:bg-[#581b7b] transition duration-200"
                >
                  Log In
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
