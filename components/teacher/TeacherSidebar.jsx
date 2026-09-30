'use client'
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

import { FaHome, FaBook, FaChalkboardTeacher, FaPalette, FaBars, FaTimes, FaComments } from "react-icons/fa";
import TeacherSidebarItem from "./TeacherSidebarItem";

export default function TeacherSidebar({ collapsed, onToggle }) {
  const { currentTheme } = useTheme();
  const [open, setOpen] = useState(!collapsed);

  // Update open state when collapsed prop changes
  React.useEffect(() => {
    setOpen(!collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onToggle) {
      onToggle();
    }
  };

  // Dynamic styles based on theme
  const isWhiteTheme = currentTheme.hexColor === '#ffffff' || currentTheme.hexColor.toLowerCase() === '#fff';
  
  const sidebarStyles = isWhiteTheme
    ? { backgroundColor: '#ffffff' }
    : { backgroundColor: currentTheme.hexColor };
    
  const headerTextStyles = isWhiteTheme
    ? { color: '#374151' }
    : { color: '#ffffff' };
    
  const iconStyles = isWhiteTheme
    ? { color: currentTheme.hexColor !== '#ffffff' ? currentTheme.hexColor : '#6b7280' }
    : { color: '#ffffff' };

  const hoverStyles = isWhiteTheme
    ? 'hover:bg-gray-100'
    : 'hover:bg-black hover:bg-opacity-10';

  return (
    <aside 
      className={`fixed top-0 left-0 h-full shadow-lg z-40 transition-all duration-300 ${open ? 'w-64' : 'w-16'}`}
      style={sidebarStyles}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 border-opacity-30">
        <span 
          className={`font-bold text-lg transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={headerTextStyles}
        >
          Teacher Panel
        </span>
        <button
          className={`ml-auto p-2 rounded focus:outline-none transition-colors duration-200 ${hoverStyles}`}
          onClick={handleToggle}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
          {open ? (
            <FaTimes className="h-6 w-6" style={iconStyles} />
          ) : (
            <FaBars className="h-6 w-6" style={iconStyles} />
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-2 mt-6 px-2">
        {open && (
          <>
            <TeacherSidebarItem href="/teacher" icon={FaHome} label="Home" />
            <TeacherSidebarItem href="/teacher/courses" icon={FaBook} label="Courses" />
            <TeacherSidebarItem href="/teacher/classrooms" icon={FaChalkboardTeacher} label="Classroom" />
            <TeacherSidebarItem href="/teacher/forum" icon={FaComments} label="Forum" />
            <TeacherSidebarItem href="/teacher/theme" icon={FaPalette} label="Theme Selection" />
          </>
        )}
      </nav>
    </aside>
  );
}
