'use client'
import { useState, useEffect } from 'react'

export const useGetUserOffRole = () => {
    const [users, setUsers] = useState({
        admins: [],
        teachers: [],
        students: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/clerkUsers');
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch users');
            }
            
            if (result.success) {
                setUsers(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const refetch = () => {
        fetchUsers();
    };

    return {
        admins: users.admins,
        teachers: users.teachers,
        students: users.students,
        loading,
        error,
        refetch
    };
};