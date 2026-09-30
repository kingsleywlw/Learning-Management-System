'use client'
import React, { useState } from "react";
import Link from "next/link";

import { FaHome, FaUserPlus, FaPalette, FaBars, FaTimes } from "react-icons/fa";
import AdminSidebarItem from "./AdminSidebarItem";

export default function AdminSidebar() {
	const [open, setOpen] = useState(true);

	return (
		<aside className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-all duration-300 ${open ? 'w-64' : 'w-16'}`}>
			<div className="flex items-center justify-between px-4 py-4 border-b">
				<span className={`font-bold text-lg text-blue-700 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>Admin Panel</span>
				<button
				  className="ml-auto p-2 rounded hover:bg-blue-100 focus:outline-none"
				  onClick={() => setOpen((prev) => !prev)}
				  aria-label={open ? "Close sidebar" : "Open sidebar"}
				>
				  {open ? (
				    <FaTimes className="h-6 w-6 text-blue-700" />
				  ) : (
				    <FaBars className="h-6 w-6 text-blue-700" />
				  )}
				</button>
			</div>
			<nav className="flex flex-col gap-2 mt-6 px-2">
				{open && (
					<>
			<AdminSidebarItem href="/admin" icon={FaHome} label="Home" />
			<AdminSidebarItem href="/admin/createUser" icon={FaUserPlus} label="Create User" />
			<AdminSidebarItem href="/admin/createTheme" icon={FaPalette} label="Create Theme" />
					</>
				)}
			</nav>
		</aside>
	);
}
