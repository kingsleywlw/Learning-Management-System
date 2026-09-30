"use client";
import { useState } from "react";
import TeacherSidebar from "../../../components/teacher/TeacherSidebar";
import { useTheme } from "@/context/ThemeContext";

export default function TeacherLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentTheme } = useTheme();

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Dynamic header styles based on theme
  const isWhiteTheme = currentTheme.hexColor === '#ffffff' || currentTheme.hexColor.toLowerCase() === '#fff';
  const headerStyles = isWhiteTheme
    ? { backgroundColor: '#f8fafc' }
    : { backgroundColor: currentTheme.hexColor };
    
  const headerTextStyles = isWhiteTheme
    ? { color: '#1f2937' }
    : { color: '#ffffff' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TeacherSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}