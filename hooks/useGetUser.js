'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export const useGetUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId, isLoaded } = useAuth();

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/user/${userId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user data');
      }
      
      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when Clerk auth is loaded and we have a userId
    if (isLoaded) {
      if (userId) {
        fetchUser();
      } else {
        // User is not authenticated
        setLoading(false);
        setError('User not authenticated');
        setUser(null);
      }
    }
  }, [userId, isLoaded]);

  const refetch = () => {
    if (userId) {
      fetchUser();
    }
  };

  return {
    user,
    loading,
    error,
    refetch,
    clearError: () => setError(null)
  };
};