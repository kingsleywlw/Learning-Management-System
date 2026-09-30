'use client'
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

function TeacherSidebarItem({ href, icon: Icon, label }) {
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const isActive = pathname === href;

  // Dynamic styles based on theme
  const isWhiteTheme = currentTheme.hexColor === '#ffffff' || currentTheme.hexColor.toLowerCase() === '#fff';
  
  // Base styles for the component
  const baseClasses = "flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200";
  
  // Dynamic styles based on theme and active state
  const linkStyles = isWhiteTheme
    ? isActive
      ? { backgroundColor: currentTheme.hexColor !== '#ffffff' ? `${currentTheme.hexColor}20` : '#f3f4f6' }
      : {}
    : isActive
      ? { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
      : {};
      
  const iconStyles = isWhiteTheme
    ? isActive
      ? { color: currentTheme.hexColor !== '#ffffff' ? currentTheme.hexColor : '#4b5563' }
      : { color: '#6b7280' }
    : { color: '#ffffff' };
    
  const textStyles = isWhiteTheme
    ? isActive
      ? { color: currentTheme.hexColor !== '#ffffff' ? currentTheme.hexColor : '#374151' }
      : { color: '#374151' }
    : { color: '#ffffff' };

  const hoverClasses = isWhiteTheme
    ? 'hover:bg-gray-100'
    : 'hover:bg-white hover:bg-opacity-10';

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${hoverClasses}`}
      style={linkStyles}
    >
      <Icon className="h-6 w-6" style={iconStyles} />
      <span className="text-base font-medium" style={textStyles}>
        {label}
      </span>
    </Link>
  );
}

export default TeacherSidebarItem;
