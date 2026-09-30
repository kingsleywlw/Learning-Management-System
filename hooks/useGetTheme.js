'use client'
import { useState, useEffect } from 'react'

export const useGetTheme = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/theme');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch themes');
      }
      
      if (result.success) {
        setThemes(result.themes);
      } else {
        throw new Error(result.error || 'Failed to fetch themes');
      }
    } catch (err) {
      console.error('Error fetching themes:', err);
      setError(err.message);
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const refetch = () => {
    fetchThemes();
  };

  // Helper function to get a specific theme by hex color
  const getThemeByColor = (hexColor) => {
    return themes.find(theme => theme.hexColor === hexColor);
  };

  // Helper function to get the first available theme (for default)
  const getDefaultTheme = () => {
    return themes.length > 0 ? themes[0] : null;
  };

  return {
    themes,
    loading,
    error,
    refetch,
    getThemeByColor,
    getDefaultTheme,
    clearError: () => setError(null)
  };
};