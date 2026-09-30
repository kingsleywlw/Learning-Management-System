'use client'
import { useState } from 'react'

export const useUpdateCourseDirector = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateCourseDirector = async (courseId, courseDirectorId) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const response = await fetch(`/api/course/change-director`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId, courseDirectorId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update course director');
            }

            if (result.success) {
                setSuccess(true);
                return result.data; // Return the updated course data
            } else {
                throw new Error(result.error || 'Failed to update course director');
            }
        } catch (err) {
            console.error('Error updating course director:', err);
            setError(err.message);
            throw err; // Re-throw for component handling
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        updateCourseDirector,
        loading,
        error,
        success,
        resetState
    };
};