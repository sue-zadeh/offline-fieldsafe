import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { cacheActivity, getCachedActivity } from '../utils/localDB'

import AddActivity from './addactivity'
import ActivityRisk from './activityrisk'
import ActivityStaffs from './activitystaffs'
import ActivityVolunteers from './activityvolunteers'
import ActivityCheckList from './activitychecklist'
import ActivityOutcome from './activityoutcome'
import ActivityComplete from './activitycomplete'

interface ActivityTabsProps {
  activityName?: string
  isSidebarOpen: boolean
}

const steps = [
  'Details',
  'Risk',
  'Staff',
  'Volunteer',
  'Check List',
  'Outcome',
  'Complete',
]

const ActivityTabs: React.FC<ActivityTabsProps> = ({ isSidebarOpen }) => {
  const location = useLocation() as {
    state?: {
      activityId?: number
      activityName?: string
      projectName?: string
      startStep?: number
      fromSearch?: boolean
    }
  }

  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  )
  const [selectedActivityName, setSelectedActivityName] = useState('')
  const [selectedProjectName, setSelectedProjectName] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const id = location.state?.activityId
    if (id) {
      loadActivityDetails(id)
    }
    if (location.state?.startStep !== undefined) {
      setCurrentStep(location.state.startStep)
    }
  }, [location.state])

  async function loadActivityDetails(id: number) {
    console.log('🔍 Loading activity details for ID:', id, 'Online:', navigator.onLine)

    try {
      // Always try offline first, regardless of online status
      let activityData = await tryOfflineRetrieval(id)

      if (activityData) {
        console.log('✅ Found activity offline:', activityData)
        setSelectedActivityId(activityData.id || id)
        setSelectedActivityName(
          activityData.activity_name ||
            activityData.title ||
            activityData.name ||
            activityData.activityName ||
            'Offline Activity'
        )
        setSelectedProjectName(
          activityData.projectName ||
            activityData.project_name ||
            activityData.project ||
            'Offline Project'
        )
        return
      }

      // If not found offline and we're online, try API
      if (navigator.onLine) {
        console.log('🌐 Trying API for activity:', id)
        try {
          const res = await axios.get(`/api/activities/${id}`)
          const data = res.data
          setSelectedActivityId(data.id)
          setSelectedActivityName(data.activity_name || data.title || data.name || '')
          setSelectedProjectName(data.projectName || data.project_name || '')
          await cacheActivity(data)
          return
        } catch (apiError) {
          console.warn('API failed, trying offline again:', apiError)
          // API failed, try offline once more
          activityData = await tryOfflineRetrieval(id)
          if (activityData) {
            setSelectedActivityId(activityData.id || id)
            setSelectedActivityName(activityData.activity_name || activityData.title || 'Offline Activity')
            setSelectedProjectName(activityData.projectName || 'Offline Project')
            return
          }
        }
      }

      // Last resort: create placeholder for offline viewing
      console.log('⚠️ Activity not found anywhere, creating placeholder for ID:', id)
      setSelectedActivityId(id)
      setSelectedActivityName(`Activity ${id} (Offline)`)
      setSelectedProjectName('Unknown Project')

    } catch (err) {
      console.error('❌ Error in loadActivityDetails:', err)
      
      // Final fallback
      setSelectedActivityId(id)
      setSelectedActivityName(`Activity ${id} (Offline)`)
      setSelectedProjectName('Unknown Project')
    }
  }

  async function tryOfflineRetrieval(id: number): Promise<any> {
    console.log('🔄 Trying offline retrieval for ID:', id)

    // Strategy 1: Try getCachedActivity
    try {
      let offline = await getCachedActivity(id)
      if (offline) {
        console.log('✅ Found via getCachedActivity:', offline)
        return offline
      }
    } catch (e) {
      console.warn('getCachedActivity failed:', e)
    }

    // Strategy 2: Try localStorage with comprehensive key search
    const possibleKeys = [
      `activity_${id}`,
      `offline_activity_${id}`,
      `cached_activity_${id}`,
      `activity_data_${id}`,
      `pendingActivity_${id}`,
      `newActivity_${id}`,
      `fieldsafe_activity_${id}`,
      `activity-${id}`,
      `offlineActivity_${id}`,
      `temp_activity_${id}`,
      String(id),
    ]

    for (const key of possibleKeys) {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && (parsed.id == id || parsed.id == String(id))) {
            console.log('✅ Found in localStorage with key:', key, parsed)
            return parsed
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse localStorage key:', key, e)
      }
    }

    // Strategy 3: Search ALL localStorage keys for this activity ID
    try {
      const allKeys = Object.keys(localStorage)
      console.log('🔍 Searching through all localStorage keys:', allKeys.length)
      
      for (const key of allKeys) {
        try {
          const stored = localStorage.getItem(key)
          if (stored && stored.includes(String(id))) {
            const parsed = JSON.parse(stored)
            if (parsed && (parsed.id == id || parsed.id == String(id))) {
              console.log('✅ Found by comprehensive search in key:', key, parsed)
              return parsed
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    } catch (e) {
      console.warn('⚠️ Comprehensive localStorage search failed:', e)
    }

    // Strategy 4: Try IndexedDB - FIX THE BUG HERE
    try {
      const indexedDBResult = await tryIndexedDBRetrieval(id)
      if (indexedDBResult) {
        return indexedDBResult
      }
    } catch (e) {
      console.warn('IndexedDB retrieval failed:', e)
    }

    console.log('❌ Activity not found in any offline storage for ID:', id)
    return null
  }

  async function tryIndexedDBRetrieval(id: number): Promise<any> {
    if (!('indexedDB' in window)) return null

    try {
      // Use the correct database name from localDB.ts
      const dbRequest = indexedDB.open('FieldSafeDB', 5)
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result)
        dbRequest.onerror = () => reject(dbRequest.error)
        dbRequest.onblocked = () => reject(new Error('IndexedDB blocked'))
      })

      const storeNames = [
        'activities',
        'offline-queue', // This is where offline activities might be stored
        'volunteers',
        'projects'
      ]

      for (const storeName of storeNames) {
        if (db.objectStoreNames.contains(storeName)) {
          try {
            const transaction = db.transaction([storeName], 'readonly')
            const store = transaction.objectStore(storeName)
            
            if (storeName === 'offline-queue') {
              // Search through offline queue for activities - FIX THE ITERATION ERROR
              const getAllRequest = store.getAll()
              const allItems = await new Promise<any[]>((resolve, reject) => {
                getAllRequest.onsuccess = () => resolve(getAllRequest.result)
                getAllRequest.onerror = () => reject(getAllRequest.error)
              })
              
              for (const item of allItems) {
                if (item.type === 'activity' && item.data && (item.data.id == id || item.data.id == String(id))) {
                  console.log('✅ Found activity in offline queue:', item.data)
                  db.close()
                  return item.data
                }
              }
            } else {
              // Try both number and string versions for direct lookup
              for (const searchId of [id, String(id)]) {
                const getRequest = store.get(searchId)
                const result = await new Promise((resolve) => {
                  getRequest.onsuccess = () => resolve(getRequest.result)
                  getRequest.onerror = () => resolve(null)
                })

                if (result) {
                  console.log('✅ Found in IndexedDB store:', storeName, result)
                  db.close()
                  return result
                }
              }
            }
          } catch (storeError) {
            console.warn(`⚠️ Error accessing store ${storeName}:`, storeError)
          }
        }
      }

      db.close()
    } catch (e) {
      console.warn('⚠️ IndexedDB search failed:', e)
    }

    return null
  }

  const handleActivityUpdate = (id: number, name: string, project: string) => {
    setSelectedActivityId(id)
    setSelectedActivityName(name)
    setSelectedProjectName(project)
  }

  const handleStepClick = (index: number) => setCurrentStep(index)
  const handleNext = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1)
  const handleBack = () => currentStep > 0 && setCurrentStep(currentStep - 1)

  const renderStepNav = () => {
    const isSmallDevice = window.innerWidth < 768
    if (isSmallDevice) {
      return (
        <>
          <label htmlFor="step-selector" className="form-label">
            Navigate Steps
          </label>
          <select
            id="step-selector"
            className="form-select mb-4"
            value={currentStep}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCurrentStep(Number(e.target.value))
            }
          >
            {steps.map((label, index) => (
              <option key={index} value={index}>{`${
                index + 1
              }. ${label}`}</option>
            ))}
          </select>
        </>
      )
    }

    return (
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4">
        {steps.map((label, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          return (
            <div
              key={index}
              onClick={() => handleStepClick(index)}
              style={{ cursor: 'pointer' }}
              className="d-flex align-items-center"
            >
              <div
                className={`d-flex align-items-center justify-content-center rounded-circle text-white`}
                style={{
                  backgroundColor: isCompleted
                    ? '#28a745'
                    : isActive
                    ? '#0094B6'
                    : '#ccc',
                  width: '2.15rem',
                  height: '2.15rem',
                  fontSize: '1.2rem',
                }}
              >
                {index + 1}
              </div>
              <span
                className={`ms-2 ${isActive ? 'fw-bold' : ''}`}
                style={{
                  fontSize: '1rem',
                  color: isActive ? '#0094B6' : '#555',
                }}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className="flex-grow-1 mx-2"
                  style={{
                    height: '2px',
                    backgroundColor: isCompleted ? '#28a745' : '#ccc',
                  }}
                ></div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AddActivity
            activityId={selectedActivityId}
            initialActivityName={selectedActivityName}
            initialProjectName={selectedProjectName}
            onActivityUpdated={handleActivityUpdate}
          />
        )
      case 1:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityRisk
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
            />
          </>
        )
      case 2:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityStaffs
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
            />
          </>
        )
      case 3:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityVolunteers
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
            />
          </>
        )
      case 4:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityCheckList
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
              projectId={selectedProjectName}
            />
          </>
        )
      case 5:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityOutcome
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
            />
          </>
        )
      case 6:
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName} — Project: {selectedProjectName}
            </h5>
            <ActivityComplete
              activityId={selectedActivityId!}
              activityName={selectedActivityName}
            />
          </>
        )
      default:
        return <h5>Coming Soon...</h5>
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
        minHeight: '100vh',
      }}
    >
      {renderStepNav()}
      <div className="p-3 border rounded bg-white mx-2">
        {renderStepContent()}
      </div>
      <div className="d-flex justify-content-center mt-3">
        {currentStep > 0 && (
          <Button
            className="px-4 me-3"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleBack}
          >
            « Back
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            className="px-4"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleNext}
          >
            Next »
          </Button>
        )}
      </div>
    </div>
  )
}

export default ActivityTabs
