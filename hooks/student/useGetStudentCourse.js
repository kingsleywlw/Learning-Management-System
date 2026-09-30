import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useGetStudentCourse = (courseId) => {
  const { getToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = async (id) => {
    if (!id) {
      setError('Course ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/course/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch course');
      }

      setCourse(result.course);
      setLoading(false);
      return {
        success: true,
        course: result.course,
        message: result.message || 'Course fetched successfully'
      };

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setCourse(null);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Automatically fetch course when courseId changes
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    } else {
      setCourse(null);
      setError(null);
      setLoading(false);
    }
  }, [courseId]);

  const refetchCourse = (id = courseId) => {
    return fetchCourse(id);
  };

  return {
    course,
    loading,
    error,
    refetchCourse,
    clearError: () => setError(null)
  };
};