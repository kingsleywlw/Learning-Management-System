'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTheme } from '@/context/ThemeContext'
import { useUpdateTheme } from '@/hooks/useUpdateTheme'
import { Palette, Check, RefreshCw, AlertCircle } from 'lucide-react'

// Theme interface to match your API response
interface Theme {
  _id: string
  hexColor: string
  description: string
}

// Theme Card Component
const ThemeCard = ({ 
  theme, 
  isSelected, 
  onSelect 
}: { 
  theme: Theme
  isSelected: boolean
  onSelect: (theme: Theme) => void
}) => {
  const isDefaultTheme = theme._id === 'default-white'
  
  return (
    <div 
      className={`relative bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
          : isDefaultTheme
            ? 'border-blue-300 hover:border-blue-400'
            : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(theme)}
    >
      {/* Default theme badge */}
      {isDefaultTheme && (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          Default
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Color preview */}
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className={`w-16 h-16 rounded-lg border-2 shadow-inner ${
            isDefaultTheme ? 'border-blue-200' : 'border-gray-200'
          }`}
          style={{ backgroundColor: theme.hexColor }}
        />
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            isDefaultTheme ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {theme.description}
          </h3>
          <p className="text-sm text-gray-500 font-mono">{theme.hexColor}</p>
        </div>
      </div>

      {/* Color bar */}
      <div 
        className="w-full h-3 rounded-full"
        style={{ backgroundColor: theme.hexColor }}
      />

      {/* Selection state */}
      <div className="mt-4 text-center">
        <span className={`text-sm font-medium ${
          isSelected 
            ? 'text-blue-600' 
            : isDefaultTheme 
              ? 'text-blue-500' 
              : 'text-gray-400'
        }`}>
          {isSelected ? 'Selected' : 'Click to select'}
        </span>
      </div>
    </div>
  )
}

// Main Theme Selection Component (Reusable)
export default function ThemePage() {
  const { user } = useUser()
  const { 
    currentTheme, 
    availableThemes, 
    isLoading, 
    error, 
    setUserTheme, 
    refreshThemes 
  } = useTheme()
  const { 
    updateTheme, 
    isLoading: isUpdatingTheme, 
    error: updateError, 
    success: updateSuccess, 
    resetState 
  } = useUpdateTheme()
  
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)

  // Default theme option (always available)
  const defaultTheme: Theme = {
    _id: 'default-white',
    hexColor: '#ffffff',
    description: 'Default Theme'
  }

  // Combine default theme with available themes, ensuring default is first
  const allThemes = [defaultTheme, ...availableThemes.filter(theme => theme._id !== 'default-white')]

  // Initialize selected theme from current theme
  React.useEffect(() => {
    if (currentTheme && !selectedTheme) {
      setSelectedTheme(currentTheme)
    }
  }, [currentTheme, selectedTheme])

  // Auto-dismiss success message after 5 seconds
  React.useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        resetState()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [updateSuccess, resetState])

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme)
    console.log('Selected theme:', theme)
  }

  const handleApplyTheme = async () => {
    if (selectedTheme && user) {
      try {
        // Reset any previous update states
        resetState()
        
        // Handle default theme selection (reset to no specific theme)
        if (selectedTheme._id === 'default-white') {
          // For default theme, we pass null to reset user's theme selection
          await updateTheme(user.id, null)
        } else {
          // Update theme in database
          await updateTheme(user.id, selectedTheme._id)
        }
        
        // Update local theme context
        setUserTheme(selectedTheme)
        
        // Success feedback is handled by the success state
      } catch (err) {
        console.error('Failed to update theme:', err)
        // Error feedback is handled by the error state
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-700">Loading themes...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Themes</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={refreshThemes}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Palette className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Theme Selection</h1>
                <p className="text-gray-600 mt-1">
                  Choose your preferred color theme for the application
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Available Themes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {allThemes.length}
                </div>
              </div>
              <button
                onClick={refreshThemes}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh themes"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Theme */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Currently Active Theme</h2>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: currentTheme.hexColor }}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{currentTheme.description}</h3>
              <p className="text-sm text-gray-600 font-mono">{currentTheme.hexColor}</p>
            </div>
            <div className="flex-1" />
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>

        {/* Selected Theme Preview */}
        {selectedTheme && selectedTheme._id !== currentTheme._id && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Selection</h2>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: selectedTheme.hexColor }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTheme.description}</h3>
                <p className="text-sm text-gray-600 font-mono">{selectedTheme.hexColor}</p>
              </div>
              <div className="flex-1" />
              <button
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
                onClick={handleApplyTheme}
                disabled={isUpdatingTheme}
              >
                {isUpdatingTheme && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isUpdatingTheme ? 'Applying...' : 'Apply Theme'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Theme updated successfully! Your new theme is now active.
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {updateError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                Failed to update theme: {updateError}
              </span>
              <button
                onClick={resetState}
                className="ml-auto text-red-600 hover:text-red-700 underline text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Theme Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Themes</h2>
            <span className="text-sm text-gray-500">
              {allThemes.length} theme{allThemes.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {allThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allThemes.map((theme: Theme) => (
                <ThemeCard
                  key={theme._id}
                  theme={theme}
                  isSelected={selectedTheme?._id === theme._id}
                  onSelect={handleThemeSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Themes Available</h3>
              <p className="text-gray-600">
                No themes have been created yet. Contact your administrator to add themes.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use themes</h3>
          <div className="text-blue-800 space-y-1">
            <p>- The <strong>Default Theme</strong> (white) is always available at the top left</p>
            <p>- Click on any theme card to select it</p>
            <p>- Preview your selection in the &quot;Current Selection&quot; section above</p>
            <p>- Click &quot;Apply Theme&quot; to save your preference</p>
            <p>- Your selected theme will be applied across the entire application</p>
          </div>
        </div>
      </div>
    </div>
  )
}