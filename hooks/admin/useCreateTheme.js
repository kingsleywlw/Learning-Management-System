import { useState } from 'react';

export const useCreateTheme = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createTheme = async (themeData) => {
    const { hexColor, description } = themeData;

    // Basic validation
    if (!hexColor || !description) {
      setError('All fields are required');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/create-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hexColor,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create theme');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Return result for further handling
      return result;
      
    } catch (error) {
      console.error('Error creating theme:', error);
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
    createTheme,
    isCreating,
    error,
    success,
    resetState
  };
};