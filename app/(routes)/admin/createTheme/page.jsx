'use client'
import React, { useState } from 'react'
import { useCreateTheme } from '@/hooks/admin/useCreateTheme'

const page = () => {
  const [hexColor, setHexColor] = useState('#2563eb')
  const { createTheme, isCreating, error, success, resetState } = useCreateTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset previous state
    resetState()
    
    // Get form data
    const formData = new FormData(e.target)
    const themeData = {
      hexColor: hexColor,
      description: formData.get('description')
    }

    // Create theme
    const result = await createTheme(themeData)
    
    // If successful, optionally reset form
    if (result) {
      e.target.reset()
      setHexColor('#2563eb')
    }
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <section className="w-full max-w-2xl mt-16 bg-white rounded-xl shadow-lg p-10">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Create New Theme</h1>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <strong>Success:</strong> Theme created successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-1">Theme Description</label>
              <input
                type="text"
                id="description"
                name="description"
                required
                placeholder="Enter theme description (e.g., Professional Blue Theme)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            <div className="flex flex-col items-center">
              <label className="block text-gray-700 font-medium mb-4">
                Pick Theme Color
              </label>
              
              {/* Custom Color Picker */}
              <div className="w-full max-w-sm">
                {/* Hue Slider */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Hue</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={(() => {
                      const hex = hexColor.replace('#', '');
                      const r = parseInt(hex.substr(0, 2), 16) / 255;
                      const g = parseInt(hex.substr(2, 2), 16) / 255;
                      const b = parseInt(hex.substr(4, 2), 16) / 255;
                      const max = Math.max(r, g, b);
                      const min = Math.min(r, g, b);
                      const diff = max - min;
                      let h = 0;
                      if (diff !== 0) {
                        switch (max) {
                          case r: h = ((g - b) / diff) % 6; break;
                          case g: h = (b - r) / diff + 2; break;
                          case b: h = (r - g) / diff + 4; break;
                        }
                      }
                      return Math.round(h * 60);
                    })()}
                    onChange={(e) => {
                      const hue = parseInt(e.target.value);
                      const saturation = 70; // Fixed saturation
                      const lightness = 50;  // Fixed lightness
                      
                      // Convert HSL to RGB
                      const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
                      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
                      const m = lightness / 100 - c / 2;
                      
                      let r, g, b;
                      if (hue >= 0 && hue < 60) { r = c; g = x; b = 0; }
                      else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0; }
                      else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x; }
                      else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c; }
                      else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c; }
                      else { r = c; g = 0; b = x; }
                      
                      r = Math.round((r + m) * 255);
                      g = Math.round((g + m) * 255);
                      b = Math.round((b + m) * 255);
                      
                      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                      setHexColor(hex);
                    }}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                    }}
                  />
                </div>
                
                {/* Predefined Color Swatches */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Quick Colors</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', 
                      '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
                      '#2563eb', '#7c3aed', '#dc2626', '#059669', '#ea580c', '#0891b2'].map((color) => (
                      <div
                        key={color}
                        onClick={() => setHexColor(color)}
                        className="w-8 h-8 rounded cursor-pointer border-2 hover:border-gray-400 transition-colors"
                        style={{ 
                          backgroundColor: color,
                          borderColor: hexColor.toLowerCase() === color ? '#374151' : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Manual Hex Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Hex Code</label>
                  <input
                    type="text"
                    value={hexColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setHexColor(value);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              
              <span className="mt-4 text-gray-600 text-lg">
                Selected: <span style={{ color: hexColor, fontWeight: 'bold' }}>{hexColor.toUpperCase()}</span>
              </span>
            </div>
            
            {/* Color Preview */}
            <div className="flex flex-col items-center">
              <span className="mb-2 text-gray-700 font-medium">Preview:</span>
              <div
                className="w-full h-16 rounded-lg border"
                style={{ backgroundColor: hexColor }}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isCreating}
            className={`mt-8 w-full font-bold py-3 rounded-lg transition ${
              isCreating 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCreating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Theme...
              </span>
            ) : (
              'Create Theme'
            )}
          </button>
        </form>
      </section>
    </main>
  )
}

export default page