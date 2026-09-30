'use client'
import React, { useState } from 'react'
import { useUpdateCourseDirector } from '@/hooks/teacher/useUpdateCourseDirector'

const CourseDirector = ({ 
    course, 
    teachers = [], 
    onCourseUpdate 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDirectorId, setSelectedDirectorId] = useState('');
    const { updateCourseDirector, loading, error, success } = useUpdateCourseDirector();

    const currentDirector = course.courseDirectorId;
    
    const handleEditClick = () => {
        setIsEditing(true);
        setSelectedDirectorId(currentDirector?._id || currentDirector || '');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedDirectorId('');
    };

    const handleSave = async () => {
        if (!selectedDirectorId) {
            alert('Please select a course director');
            return;
        }

        try {
            const updatedCourse = await updateCourseDirector(course.courseId, selectedDirectorId);
            
            // Call the parent component's update function if provided
            if (onCourseUpdate) {
                onCourseUpdate(updatedCourse);
            }
            
            setIsEditing(false);
            setSelectedDirectorId('');
        } catch (err) {
            // Error is handled by the hook
            console.error('Failed to update course director:', err);
        }
    };

    const getDirectorDisplayInfo = () => {
        if (typeof currentDirector === 'object' && currentDirector !== null) {
            return {
                name: currentDirector.name || 'Unknown',
                email: currentDirector.email || 'Course Director'
            };
        }
        
        // If currentDirector is just an ID, try to find the teacher in the teachers list
        const foundTeacher = teachers.find(teacher => 
            teacher.id === currentDirector || teacher._id === currentDirector
        );
        
        if (foundTeacher) {
            return {
                name: `${foundTeacher.firstName} ${foundTeacher.lastName}`,
                email: foundTeacher.emailAddress
            };
        }
        
        return {
            name: 'Unknown',
            email: 'Course Director'
        };
    };

    const directorInfo = getDirectorDisplayInfo();

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Course Director</h2>
                {!isEditing ? (
                    <button 
                        onClick={handleEditClick}
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Change Director
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCancel}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !selectedDirectorId}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                    <span>Course director updated successfully!</span>
                </div>
            )}

            {!isEditing ? (
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full">
                        <span className="text-xl font-medium">
                            {directorInfo.name.split(' ').map(n => n[0]).join('') || '?'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{directorInfo.name}</h3>
                        <p className="text-gray-600">{directorInfo.email}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select New Course Director
                        </label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={selectedDirectorId}
                            onChange={(e) => setSelectedDirectorId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Choose a teacher...</option>
                            {teachers.map((teacher) => (
                                <option 
                                    key={teacher.id} 
                                    value={teacher.id}
                                >
                                    {teacher.firstName} {teacher.lastName} - {teacher.emailAddress}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDirector;