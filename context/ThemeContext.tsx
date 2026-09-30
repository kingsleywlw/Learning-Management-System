'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useGetTheme } from '@/hooks/useGetTheme'
import { useGetUser } from '@/hooks/useGetUser'

// Theme interface
interface Theme {
  _id: string
  hexColor: string
  description: string
}

// User interface (minimal for theme context)
interface User {
  selectedThemeId?: string | null
  [key: string]: any
}

// Default white theme (fallback when no themes are available)
const DEFAULT_WHITE_THEME: Theme = {
  _id: 'default-white',
  hexColor: '#ffffff',
  description: 'Default White Theme'
}

// Context interface
interface ThemeContextType {
  currentTheme: Theme
  availableThemes: Theme[]
  isLoading: boolean
  error: string | null
  setUserTheme: (theme: Theme) => void
  refreshThemes: () => void
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themes, loading: themesLoading, error: themesError, refetch: refetchThemes } = useGetTheme()
  const { user, loading: userLoading, error: userError } = useGetUser()
  const [currentTheme, setCurrentTheme] = useState<Theme>(DEFAULT_WHITE_THEME)

  useEffect(() => {
    // Wait for both user and themes to load
    if (!themesLoading && !userLoading) {
      let selectedTheme = DEFAULT_WHITE_THEME

      if (themes && themes.length > 0) {
        // If user has selected a theme, find it
        const typedUser = user as unknown as User
        if (typedUser && typedUser.selectedThemeId) {
          const userSelectedTheme = themes.find((theme: Theme) => theme._id === typedUser.selectedThemeId)
          if (userSelectedTheme) {
            selectedTheme = userSelectedTheme
          }
        } else {
          // User hasn't selected a theme, use default white (or first available white-ish theme)
          const whiteTheme = themes.find((theme: Theme) => 
            theme.hexColor.toLowerCase() === '#ffffff' || 
            theme.description.toLowerCase().includes('white')
          )
          selectedTheme = whiteTheme || DEFAULT_WHITE_THEME
        }
      }

      setCurrentTheme(selectedTheme)
    }
  }, [themes, user, themesLoading, userLoading])

  // Apply theme to document root
  useEffect(() => {
    if (currentTheme && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--theme-primary', currentTheme.hexColor)
      document.documentElement.setAttribute('data-theme-color', currentTheme.hexColor)
    }
  }, [currentTheme])

  const setUserTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    // TODO: Add API call to save user's theme preference
    console.log('Setting user theme:', theme)
  }

  const refreshThemes = () => {
    refetchThemes()
  }

  const contextValue: ThemeContextType = {
    currentTheme,
    availableThemes: themes || [],
    isLoading: themesLoading || userLoading,
    error: themesError || userError,
    setUserTheme,
    refreshThemes
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export type { Theme }