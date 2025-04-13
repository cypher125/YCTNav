"use client"

import { useState, useEffect } from 'react'
import { Building } from '@/lib/types'
import { loadBuildings, saveBuildings } from '@/lib/api/buildings'

export default function ApiTest() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Load buildings on component mount
  useEffect(() => {
    loadBuildingsFromServer()
  }, [])

  const loadBuildingsFromServer = async () => {
    setIsLoading(true)
    setStatus('Loading buildings...')
    
    try {
      const buildingsData = await loadBuildings()
      setBuildings(buildingsData)
      setStatus(`Loaded ${buildingsData.length} buildings successfully`)
    } catch (error) {
      console.error('Error loading buildings:', error)
      setStatus(`Error loading buildings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const saveBuildingsToServer = async () => {
    setIsLoading(true)
    setStatus('Saving buildings...')
    
    try {
      // Add a timestamp to the test building to verify it's new
      const testBuilding: Building = {
        id: `test-building-${Date.now()}`,
        name: `Test Building ${new Date().toLocaleTimeString()}`,
        department: 'Test Department',
        description: 'Building created for API testing',
        coordinates: { lat: 6.519, lng: 3.378 }
      }
      
      const updatedBuildings = [...buildings, testBuilding]
      
      const message = await saveBuildings(updatedBuildings)
      setBuildings(updatedBuildings)
      setStatus(`Saved successfully: ${message}`)
    } catch (error) {
      console.error('Error saving buildings:', error)
      setStatus(`Error saving buildings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearBuildings = async () => {
    setIsLoading(true)
    setStatus('Clearing buildings...')
    
    try {
      const message = await saveBuildings([])
      setBuildings([])
      setStatus(`Cleared buildings: ${message}`)
    } catch (error) {
      console.error('Error clearing buildings:', error)
      setStatus(`Error clearing buildings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">YabaTech Campus API Test</h1>
      
      <div className="mb-6 flex gap-4">
        <button 
          onClick={loadBuildingsFromServer}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Load Buildings
        </button>
        
        <button 
          onClick={saveBuildingsToServer}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Add Test Building
        </button>
        
        <button 
          onClick={clearBuildings}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Clear All Buildings
        </button>
      </div>
      
      <div className={`mb-6 p-4 rounded ${
        status.includes('Error') ? 'bg-red-100 text-red-800' : 
        status.includes('Loading') ? 'bg-blue-100 text-blue-800' : 
        'bg-green-100 text-green-800'
      }`}>
        <p><strong>Status:</strong> {status}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Buildings ({buildings.length})</h2>
        
        {buildings.length === 0 ? (
          <p className="text-gray-500">No buildings found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildings.map(building => (
              <div key={building.id} className="bg-white p-4 rounded shadow-md">
                <h3 className="font-bold text-lg">{building.name}</h3>
                <p className="text-gray-600">{building.department}</p>
                {building.description && <p className="text-sm mt-2">{building.description}</p>}
                <p className="text-xs mt-2 text-gray-500">
                  Coordinates: {building.coordinates.lat.toFixed(6)}, {building.coordinates.lng.toFixed(6)}
                </p>
                <p className="text-xs mt-1 text-gray-500">ID: {building.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 