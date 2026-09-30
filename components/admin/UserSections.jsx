'use client'
import React, { useState, useMemo } from "react";
import DeleteUserButton from "./DeleteUserButton";

export default function UserSections({ allUsers }) {
    
    // Search state
    const [searchEmail, setSearchEmail] = useState("");
    
    // Filter users based on email search
    const filteredUsers = useMemo(() => {
        if (!searchEmail.trim()) {
            return allUsers;
        }
        return allUsers.filter(user => 
            user.emailAddress.toLowerCase().includes(searchEmail.toLowerCase())
        );
    }, [allUsers, searchEmail]);

    // Role-based color classes
    const getRoleColorClass = (role) => {
        switch(role) {
        case 'admin':
            return 'text-red-600 font-semibold';
        case 'teacher':
            return 'text-blue-600 font-medium';
        case 'student':
            return 'text-green-600';
        default:
            return 'text-gray-600';
        }
    };

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
            
            <div className="mb-6">
                <div className="px-4 py-3 rounded-t-lg border-b bg-gray-50 border-gray-200 text-gray-800">
                    <h3 className="text-lg font-semibold">
                        Users ({filteredUsers.length}{searchEmail && ` of ${allUsers.length}`})
                    </h3>
                </div>
                <div className="bg-white border-l border-r border-b rounded-b-lg">
                    {filteredUsers.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                            {filteredUsers.map((user, idx) => {
                                const firstName = user.firstName;
                                const lastName = user.lastName;
                                const fullName = `${firstName} ${lastName}`;
                                return (
                                    <div key={idx} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold ${getRoleColorClass(user.role)} bg-gray-100`}>
                                                    {user.role}
                                                </span>
                                                <span className="font-medium text-gray-900">{fullName}</span>
                                            </div>
                                            <span className="text-gray-500 text-xs mt-1">{user.emailAddress}</span>
                                        </div>
                                        <DeleteUserButton userId={user.id} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                            {searchEmail ? `No users found matching "${searchEmail}"` : "No users found"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}