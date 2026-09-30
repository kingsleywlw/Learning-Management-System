import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useGetTeacherCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  const fetchCourses = async () => {
    if (!userId) {
      setError('User must be authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teacher/get-course/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses');
      }

      setCourses(result.courses);
      setLoading(false);
      return {
        success: true,
        courses: result.courses,
        message: result.message || 'Courses fetched successfully'
      };

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setCourses([]);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Automatically fetch courses when the hook is used and user is available
  useEffect(() => {
    if (userId) {
      fetchCourses();
    }
  }, [userId]);

  const refetchCourses = () => {
    return fetchCourses();
  };

  return {
    courses,
    loading,
    error,
    refetchCourses,
    clearError: () => setError(null)
  };
};