"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "../../components/input/PasswordInput";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false); // Global loading state

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [popup, setPopup] = useState({ show: false, message: "", type: "" });

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const router = useRouter();

    useEffect(() => {
        const userId = sessionStorage.getItem("adminId");
        if (userId) {
            router.push('/superAdmin/homepage');
        }
    }, [router]);

    const showPopup = (message, type = "success") => {
        setPopup({ show: true, message, type });
        setTimeout(() => {
            setPopup({ show: false, message: "", type: "" });
        }, 5000);
    };

    const handleRegisterChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent double click

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem("isAdmin", true);
                showPopup("Login Successful!", "success");
                router.push("/superAdmin/homepage");
            } else {
                const displayMessage = data.reason
                    ? `${data.message}: ${data.reason}`
                    : (data.message || "Invalid credentials");
                showPopup(displayMessage || "Invalid credentials", "error");
            }
        } catch (err) {
            showPopup("Connection error. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>  {
            popup.show && (
                <div
                    className={`
            fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 z-300 animate-slideIn
            ${popup.type === "success" ? "bg-green-600" : "bg-red-600"}
        `}
                >
                    <span>{popup.message}</span>
                    <button
                        onClick={() => setPopup({ show: false, message: "", type: "" })}
                        className="text-white font-bold text-lg"
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="bg-[#F7F8FA] flex justify-center items-center min-h-screen md:h-screen p-[20px] md:p-[40px] lg:p-[80px]">
                <div className="w-full bg-[#ffff] flex flex-col-reverse md:flex-row shadow-md h-full">
                    <div className="w-full lg:w-1/2 flex items-center justify-center">

                            <div>
                                <div className="flex w-full justify-center mt-6">
                                    <Link
                                        href="/"
                                    >
                                        <Image
                                            src="/images/login/logos.png"
                                            alt="Logo"
                                            width={64}
                                            height={44}
                                            className=" object-contain"
                                        />
                                    </Link>
                                </div>
                                <form
                                    onSubmit={handleLoginSubmit}
                                    className="bg-white text-black p-6 w-full max-w-md flex flex-col items-center"
                                >
                                    <h1 className="text-2xl font-semibold mb-2 text-[#1B1B1B] text-left w-full">Welcome Back</h1>
                                    <p className="text-[#8C8C8C] text-left  w-full text-[14px] mb-8">Enter your email and password to access your account</p>

                                    <div className="mb-6 w-full">
                                        <label className="block mb-1 text-[#1B1B1B] text-[14px]">username</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your username"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                            className="w-full border-b border-[#B0B0B0] p-2 bg-white text-[#4E4E4E] focus:border-b-[#5AB3E8] transition-all duration-300 outline-none"
                                        />
                                    </div>

                                    <div className="mb-6 w-full">
                                        <label className="block mb-1 text-[#1B1B1B] text-[14px]">Password</label>
                                        <PasswordInput
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-[#5AB3E8] transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        {isLoading ? "Logging in..." : "Login"}
                                    </button>
                                </form>
                            </div>
                    </div>
                    <div className="bg-[#F7F8FA] w-full md:w-[80%] flex-col hidden md:flex">
                        <div className="p-6">
                            <h1 className="text-[#1B1B1B] text-[26px] md:text-4xl font-semibold mb-2">Welcome to Our Platform</h1>
                            <p className="text-[#8C8C8C] text-md max-w-[400px]">
                                Streamline your experience and access everything you need in one place.
                            </p>
                        </div>

                        <div className="relative mt-6 flex-1 overflow-hidden">
                            <img src="/images/login/dashboardv1.jpeg" alt="dashboard" className="  
              h-full
              w-[100%]
        translate-x-[9%] 
        rotate-[-16deg]
        "
                            />
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}