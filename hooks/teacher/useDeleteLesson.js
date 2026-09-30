import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useDeleteLesson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  const deleteLesson = async (lessonId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }

      if (!userId) {
        throw new Error('User must be authenticated');
      }

      // Send delete request to API route
      const response = await fetch('/api/teacher/delete-lesson', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete lesson');
      }

      setLoading(false);
      return {
        success: true,
        message: result.message || 'Lesson deleted successfully'
      };

    } catch (err) {
      setError(err.message);
      setLoading(false);
      return {
        success: false,
        error: err.message
      };
    }
  };

  return {
    deleteLesson,
    loading,
    error,
    clearError: () => setError(null)
  };
};