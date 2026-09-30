import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useCreateLesson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  const createLesson = async (lessonData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!lessonData.title || !lessonData.title.trim()) {
        throw new Error('Lesson title is required');
      }

      if (!lessonData.courseId) {
        throw new Error('Course ID is required');
      }

      if (!userId) {
        throw new Error('User must be authenticated');
      }

      // Clean up the lesson data
      const cleanedLessonData = {
        ...lessonData,
        title: lessonData.title.trim(),
        objectives: typeof lessonData.objectives === 'string' 
          ? lessonData.objectives.trim() 
          : '',
        readingList: Array.isArray(lessonData.readingList) 
          ? lessonData.readingList.filter(item => item && item.trim() !== '') 
          : [],
        userId
      };

      // Send data to API route
      const response = await fetch('/api/teacher/create-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedLessonData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create lesson');
      }

      setLoading(false);
      return {
        success: true,
        lesson: result.lesson,
        message: result.message || 'Lesson created successfully'
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
    createLesson,
    loading,
    error,
    clearError: () => setError(null)
  };
};