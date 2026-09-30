import { useState } from "react";

import { Home, BookOpen, UserPlus, Menu, X, Palette, MessageSquare } from "lucide-react";
import { StudentSidebarItem } from "./StudentSidebarItem";
import { useTheme } from "@/context/ThemeContext";

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const StudentSidebar = ({ collapsed, onToggle }: StudentSidebarProps) => {
  const { currentTheme } = useTheme();

  const sidebarItems = [
    {
      href: "/student",
      icon: <Home size={20} />,
      label: "Dashboard"
    },
    {
      href: "/student/courses",
      icon: <BookOpen size={20} />,
      label: "My Courses"
    },
    {
      href: "/student/enrol",
      icon: <UserPlus size={20} />,
      label: "Enroll"
    },
    {
      href: "/student/forum",
      icon: <MessageSquare size={20} />,
      label: "Forum"
    },
    {
      href: "/student/theme",
      icon: <Palette size={20} />,
      label: "Themes"
    }
  ];

  return (
    <div 
      className={`${collapsed ? "w-20" : "w-64"} border-r transition-all duration-300 flex flex-col`}
      style={{ 
        backgroundColor: currentTheme.hexColor,
        borderRightColor: `${currentTheme.hexColor}30`
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ borderBottomColor: `${currentTheme.hexColor}30` }}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 
              className="text-lg font-semibold"
              style={{ 
                color: currentTheme.hexColor === '#ffffff' ? '#1f2937' : '#ffffff'
              }}
            >
              Student Portal
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: currentTheme.hexColor === '#ffffff' ? '#6b7280' : '#e5e7eb',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.hexColor === '#ffffff' ? '#f3f4f6' : 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <StudentSidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};