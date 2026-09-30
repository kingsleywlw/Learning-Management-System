'use client'
import React from 'react';
import { useDeleteUser } from '../../hooks/admin/useDeleteUser';

export default function DeleteUserButton({ userId }) {
  const { deleteUser, isDeleting } = useDeleteUser();

  const handleDelete = () => {
    deleteUser(userId);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors ${
        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isDeleting ? (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}