import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

interface StudentSidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

export const StudentSidebarItem = ({ href, icon, label, collapsed }: StudentSidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { currentTheme } = useTheme();

  const isWhiteTheme = currentTheme.hexColor === '#ffffff';

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
      style={{
        backgroundColor: isActive 
          ? (isWhiteTheme ? '#dbeafe' : 'rgba(255,255,255,0.15)')
          : 'transparent',
        color: isActive 
          ? (isWhiteTheme ? '#1d4ed8' : '#ffffff')
          : (isWhiteTheme ? '#374151' : '#e5e7eb')
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = isWhiteTheme ? '#f3f4f6' : 'rgba(255,255,255,0.1)';
          e.currentTarget.style.color = isWhiteTheme ? '#111827' : '#ffffff';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = isWhiteTheme ? '#374151' : '#e5e7eb';
        }
      }}
    >
      <div 
        className="flex-shrink-0"
        style={{
          color: isActive 
            ? (isWhiteTheme ? '#1d4ed8' : '#ffffff')
            : (isWhiteTheme ? '#6b7280' : '#d1d5db')
        }}
      >
        {icon}
      </div>
      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  );
};