import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

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

  // Current step in the wizard (0..6)
  const [currentStep, setCurrentStep] = useState(0)

  // which activity are we working on?
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  )
  // display Activity name and Project name in the header of tab pages
  const [selectedActivityName, setSelectedActivityName] = useState('')
  const [selectedProjectName, setSelectedProjectName] = useState('')

  /**  see if we have a known activityId or starting step. */
  useEffect(() => {
    if (location.state?.startStep !== undefined) {
      setCurrentStep(location.state.startStep)
    }
    if (location.state?.activityId) {
      // fetch the activity from DB to get fresh data (including its name, project name, etc.)
      loadActivityDetails(location.state.activityId)
    }
  }, [location.state])

  async function loadActivityDetails(id: number) {
    try {
      const res = await axios.get(`/api/activities/${id}`)
      const data = res.data
      setSelectedActivityId(data.id)
      setSelectedActivityName(data.activity_name || '')
      setSelectedProjectName(data.projectName || '')
    } catch (err) {
      console.error('Error fetching activity detail:', err)
    }
  }

  const handleActivityUpdate = (
    activityId: number,
    activityName: string,
    projectName: string
  ) => {
    setSelectedActivityId(activityId)
    setSelectedActivityName(activityName)
    setSelectedProjectName(projectName)
  }

  /** Step navigation */
  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  /** Renders the top 'wizard Tabs' as a dropdown (for small screens). */
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
              <option key={index} value={index}>
                {`${index + 1}. ${label}`}
              </option>
            ))}
          </select>
        </>
      )
    } else {
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
                  className={`d-flex align-items-center justify-content-center rounded-circle ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isActive
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{
                    backgroundColor: '#738c40',
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
  }

  /** Renders the content for each wizard step. */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // The "Details" step => show AddActivity (edit form).
        //pass only activityId and the existing name(s).
        return (
          <AddActivity
            activityId={selectedActivityId}
            initialActivityName={selectedActivityName}
            initialProjectName={selectedProjectName}
            onActivityUpdated={handleActivityUpdate}
          />
        )

      case 1:
        // "Risk" step. expect an activity to exist. If not, prompt user to do step 0 first.
        if (!selectedActivityId) {
          return (
            <h5>
              Please fill "Details" tab first (create or select an activity).
            </h5>
          )
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            {/* child component can take `activityId`, `activityName`*/}
            <ActivityRisk
              activityId={selectedActivityId}
              activityName={selectedActivityName}
            />
          </>
        )

      case 2:
        // "Staff" step
        if (!selectedActivityId) {
          return <h5>Please complete "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityStaffs
              activityId={selectedActivityId}
              activityName={selectedActivityName}
            />
          </>
        )

      case 3:
        // "Volunteer" step
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityVolunteers
              activityId={selectedActivityId}
              activityName={selectedActivityName}
            />
          </>
        )

      case 4:
        // "Check List" step
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityCheckList
              activityId={selectedActivityId}
              activityName={selectedActivityName}
            />
          </>
        )

      case 5:
        // "Outcome" step
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityOutcome
              activityId={selectedActivityId}
              activityName={selectedActivityName}
            />
          </>
        )

      case 6:
        // "Complete" step
        if (!selectedActivityId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className="my-3 fw-bold">
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityComplete
              activityId={selectedActivityId}
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
            &laquo; Back
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            className="px-4"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleNext}
          >
            Next &raquo;
          </Button>
        )}
      </div>
    </div>
  )
}

export default ActivityTabs
