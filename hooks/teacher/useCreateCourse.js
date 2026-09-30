import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useCreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  const createCourse = async (courseId, title, credits) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!courseId || !title || !credits) {
        throw new Error('Course ID, title, and credits are required');
      }

      if (!userId) {
        throw new Error('User must be authenticated');
      }

      // Send data to API route
      const response = await fetch('/api/teacher/create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          title,
          credits,
          userId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create course');
      }

      setLoading(false);
      return {
        success: true,
        course: result.course,
        message: result.message || 'Course created successfully'
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
    createCourse,
    loading,
    error,
    clearError: () => setError(null)
  };
};