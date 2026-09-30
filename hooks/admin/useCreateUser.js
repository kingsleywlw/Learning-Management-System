import { useState } from 'react';

export const useCreateUser = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createUser = async (userData) => {
    const { firstName, lastName, username, emailAddress, password, role } = userData;

    // Basic validation
    if (!firstName || !lastName || !username || !emailAddress || !password || !role) {
      setError('All fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      setError('Please select a valid role');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          emailAddress,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user account');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Optionally reset form or redirect
      return result;
      
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    createUser,
    isCreating,
    error,
    success,
    resetState
  };
};