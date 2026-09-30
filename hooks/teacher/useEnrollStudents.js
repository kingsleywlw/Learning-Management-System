'use client'
import { useState } from 'react'

export const useEnrollStudents = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const enrollStudents = async (courseId, studentIds) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Validate required fields
            if (!courseId) {
                throw new Error('Course ID is required');
            }

            if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
                throw new Error('At least one student must be selected');
            }

            const response = await fetch('/api/course/enroll-students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    courseId, 
                    studentIds 
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to enroll students');
            }

            if (result.success) {
                setSuccess(true);
                return {
                    success: true,
                    data: result.data,
                    message: result.message || 'Students enrolled successfully'
                };
            } else {
                throw new Error(result.error || 'Failed to enroll students');
            }
        } catch (err) {
            console.error('Error enrolling students:', err);
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
    };

    return {
        enrollStudents,
        loading,
        error,
        success,
        resetState
    };
};