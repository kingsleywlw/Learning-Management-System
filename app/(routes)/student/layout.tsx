"use client";
import { useState } from "react";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar 
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
