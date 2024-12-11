"use client";
import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from "@/public/logo.png";
import textLogo from "@/public/textLogo.png";
import Image from 'next/image';

const Navbar = () => {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false); // Menu open state

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogOut = () =>{
        sessionStorage.removeItem('token');
        setTimeout(() => {
            router.push('/');
            
        }, 2000);
    }

    return (
        <div className="">
            <div className="fixed top-0 left-0 z-10 flex items-center justify-between w-full px-2 py-2 bg-white bg-opacity-40 shadow-md">
                {/* Logo */}
                
                    <Link href="/pages/home"><Image src={logo} alt="Logo" className="w-12 h-12 " /></Link>
                    <Link href="/pages/home"><Image src={textLogo} alt="textLogo" className="w-[250px] h-12 " /></Link>
                
                {/* FaBars Icon to toggle menu */}
                <FaBars className="text-[30px] text-black font-bold cursor-pointer" onClick={toggleMenu} />
            </div>

            {/* Sliding Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 backdrop-blur-md z-50 transition-transform duration-500 ${
                    menuOpen ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="relative p-6">
                    {/* Close icon */}
                    <FaTimes
                        className="text-[40px] text-white cursor-pointer mb-6 absolute top-[15px] right-[15px] transition-transform duration-200 hover:scale-110"
                        onClick={toggleMenu}
                    />

                    {/* Menu items as button-like views */}
                    <ul className="space-y-6 mt-[50px] text-center">
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl">
                            <Link href="/pages/create_new_month">CREATE NEW MONTH</Link>
                        </li>
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl">
                            <Link href="/pages/getPdf">GET PDF</Link>
                        </li>
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl">
                            <Link href="/pages/month_list">ALL MONTH</Link>
                        </li>
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl">
                            <Link href="/pages/room_list">SHOW ALL DATA </Link>
                        </li>
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl">
                            <Link href="/pages/create_room">CREATE ROOM</Link>
                        </li>
                        <li className="text-white text-[20px] font-bold tracking-wide cursor-pointer bg-blue-600 py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-xl" onClick={handleLogOut}>
                            LOGOUT
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
