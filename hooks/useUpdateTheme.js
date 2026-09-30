import { useState } from 'react';

export const useUpdateTheme = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateTheme = async (userId, themeId) => {
    // Reset states
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // themeId can be null for default theme, so we only check if it's undefined

      // Make API request
      const response = await fetch('/api/theme/update-user-theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          themeId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update theme');
      }

      setSuccess(true);
      setIsLoading(false);
      
      return data;

    } catch (err) {
      const errorMessage = err.message || 'An error occurred while updating theme';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    updateTheme,
    isLoading,
    error,
    success,
    resetState
  };
};