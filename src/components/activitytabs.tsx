import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import {cacheActivity, getCachedActivity } from '../utils/localDB'

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
    try {
      if (navigator.onLine) {
        const res = await axios.get(`/api/activities/${id}`)
        const data = res.data
        setSelectedActivityId(data.id)
        setSelectedActivityName(data.activity_name || data.title || '')
        setSelectedProjectName(data.projectName || '')
        await cacheActivity(data) // cache for offline
      } else {
        // First try cached activities (from server)
        let offline = await getCachedActivity(id)
        
        // If not found in cache, check offline queue
        if (!offline) {
          try {
            const { getSyncedItems, getUnsyncedItems } = await import('../utils/localDB')
            const synced = await getSyncedItems()
            const unsynced = await getUnsyncedItems()
            const allOfflineItems = [...synced, ...unsynced]
              .filter((i) => i.type === 'activity')
              .map((i) => i.data)

            // Check both id and timestamp fields for offline activities
            offline = allOfflineItems.find((a) => 
              a.id === id || 
              a.timestamp === id ||
              (typeof a.id === 'string' && a.id.includes(id.toString()))
            )
            
            if (offline) {
              // Cache the offline activity for future access
              await cacheActivity(offline)
            }
          } catch (err) {
            console.error('Error checking offline activity queue:', err)
          }
        }
        
        if (offline) {
          setSelectedActivityId(offline.id || offline.timestamp || id)
          setSelectedActivityName(
            offline.activity_name || offline.title || 'Offline Activity'
          )
          setSelectedProjectName(offline.projectName || 'Offline Project')
        } else {
          console.warn('⚠️ Activity not found locally:', id)
          // Don't show alert - just handle gracefully
          setSelectedActivityId(null)
          setSelectedActivityName('')
          setSelectedProjectName('')
        }
      }
    } catch (err) {
      if (!navigator.onLine) {
        // Offline fallback - try to find in offline queue
        try {
          const { getSyncedItems, getUnsyncedItems } = await import('../utils/localDB')
          const synced = await getSyncedItems()
          const unsynced = await getUnsyncedItems()
          const allOfflineItems = [...synced, ...unsynced]
            .filter((i) => i.type === 'activity')
            .map((i) => i.data)

          const offline = allOfflineItems.find((a) => 
            a.id === id || 
            a.timestamp === id ||
            (typeof a.id === 'string' && a.id.includes(id.toString()))
          )
          
          if (offline) {
            setSelectedActivityId(offline.id || offline.timestamp || id)
            setSelectedActivityName(
              offline.activity_name || offline.title || 'Offline Activity'
            )
            setSelectedProjectName(offline.projectName || 'Offline Project')
            // Cache for future access
            await cacheActivity(offline)
          } else {
            console.warn('⚠️ Activity not found in offline mode:', id)
            setSelectedActivityId(null)
            setSelectedActivityName('')
            setSelectedProjectName('')
          }
        } catch (offlineErr) {
          console.error('❌ Failed to load activity details (offline)', offlineErr)
          setSelectedActivityId(null)
          setSelectedActivityName('')
          setSelectedProjectName('')
        }
      } else {
        console.error('❌ Failed to load activity details (online)', err)
        alert('Failed to load activity.')
      }
    }
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
            onChange={(e) => setCurrentStep(Number(e.target.value))}
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
    if (!selectedActivityId && currentStep !== 0) {
      return <h5>Please complete the "Details" tab first.</h5>
    }

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
