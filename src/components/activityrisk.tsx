import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import {
  Button,
  Table,
  Modal,
  Form,
  Tabs,
  Tab,
  Alert,
  ButtonGroup,
} from 'react-bootstrap'
import axios from 'axios'

// -------------------------------------------
// Inline <style> to get rid of bootstrap style for tab color
// -------------------------------------------
const inlineTabStyle = `
  .nav-tabs .nav-link.active {
    color: #0094B6 !important;
    font-weight: bold;
    background-color: #eef8fb !important;
    border-color: #0094B6 #0094B6 transparent !important;
  }
  .nav-tabs .nav-link {
    color: #333;
  }
`

interface ActivityRiskProps {
  activityId: number
  activityName: string
}

interface RiskTitle {
  id: number
  title: string
  isReadOnly?: boolean
}

interface RiskRow {
  activityRiskId: number
  riskId: number
  riskTitleId: number
  risk_title_label: string
  likelihood: string
  consequences: string
  risk_rating: string
}

//
// IMPORTANT: We have "risk_id" in bridging. should keep it in DetailedRiskControl:
//
interface DetailedRiskControl {
  activityRiskControlId: number
  activity_id: number
  risk_id: number // to store which risk this control belongs to
  risk_control_id: number
  control_text: string
  is_checked: boolean
}

interface RiskControlForTitle {
  id: number
  control_text: string
}

interface Hazard {
  id: number
  hazard_description: string
}

interface OptionType {
  value: number
  label: string
}

const ActivityRisk: React.FC<ActivityRiskProps> = ({ activityId }) => {
  const [message, setMessage] = useState<string | null>(null)

  // ---------- RISK DATA ----------
  const [allRiskTitles, setAllRiskTitles] = useState<RiskTitle[]>([])
  const [activityRisks, setActivityRisks] = useState<RiskRow[]>([])
  const [detailedRiskControls, setDetailedRiskControls] = useState<
    DetailedRiskControl[]
  >([])

  // Modal states
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiskRow | null>(null)

  // Form fields
  const [selectedRiskTitleId, setSelectedRiskTitleId] = useState<number | null>(
    null
  )
  const [riskControlsForTitle, setRiskControlsForTitle] = useState<
    RiskControlForTitle[]
  >([])
  const [chosenControlIds, setChosenControlIds] = useState<number[]>([])
  const [likelihood, setLikelihood] = useState('')
  const [consequences, setConsequences] = useState('')
  const [localRiskRating, setLocalRiskRating] = useState('')
  const [newControlText, setNewControlText] = useState('')

  // ---------- HAZARDS ----------
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [activitySiteHazards, setActivitySiteHazards] = useState<Hazard[]>([])
  const [activityPeopleHazards, setActivityPeopleHazards] = useState<Hazard[]>(
    []
  )

  const [showHazardModal, setShowHazardModal] = useState(false)
  const [hazardTab, setHazardTab] = useState<'site' | 'activity'>('site')
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([])
  const [newSiteHazard, setNewSiteHazard] = useState('')
  const [newActivityHazard, setNewActivityHazard] = useState('')

  const [newRiskTitle, setNewRiskTitle] = useState('')

  // On mount, load everything
  useEffect(() => {
    loadAllRiskTitles()
    loadActivityRisks()
    loadDetailedRiskControls()
    loadAllHazards()
    loadActivityHazards()
  }, [activityId])

  // risk titles
  async function loadAllRiskTitles() {
    try {
      const res = await axios.get('/api/risks')
      setAllRiskTitles(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load risk titles.')
    }
  }

  // activity_risks bridging
  async function loadActivityRisks() {
    try {
      const res = await axios.get(
        `/api/activity_risks?activityId=${activityId}`
      )
      setActivityRisks(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load activity risks.')
    }
  }

  // activity_risk_controls/detailed
  async function loadDetailedRiskControls() {
    try {
      const res = await axios.get(
        `/api/activity_risk_controls/detailed?activityId=${activityId}`
      )
      setDetailedRiskControls(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // hazards
  async function loadAllHazards() {
    try {
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)

      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load hazard definitions.')
    }
  }

  async function loadActivityHazards() {
    try {
      const shRes = await axios.get(
        `/api/activity_site_hazards?activityId=${activityId}`
      )
      setActivitySiteHazards(shRes.data)

      const ahRes = await axios.get(
        `/api/activity_activity_people_hazards?activityId=${activityId}`
      )
      setActivityPeopleHazards(ahRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load hazards for this activity.')
    }
  }

  // Recompute risk rating
  useEffect(() => {
    setLocalRiskRating(computeLocalRiskRating(likelihood, consequences))
  }, [likelihood, consequences])

  function computeLocalRiskRating(like: string, cons: string): string {
    if (!like || !cons) return ''
    const l = like.toLowerCase().trim()
    const c = cons.toLowerCase().trim()

    if (l === 'highly unlikely') {
      if (['insignificant', 'minor', 'moderate'].includes(c)) return 'Low risk'
      if (c === 'major') return 'moderate risk'
      if (c === 'catastrophic') return 'High risk'
    }
    if (l === 'unlikely') {
      if (c === 'insignificant') return 'Low risk'
      if (['minor', 'moderate'].includes(c)) return 'moderate risk'
      if (['major', 'catastrophic'].includes(c)) return 'High risk'
    }
    if (l === 'quite possible') {
      if (c === 'insignificant') return 'Low risk'
      if (c === 'minor') return 'moderate risk'
      if (['moderate', 'major'].includes(c)) return 'High risk'
      if (c === 'catastrophic') return 'Extreme risk'
    }
    if (l === 'likely') {
      if (['minor', 'moderate'].includes(c)) return 'High risk'
      if (c === 'insignificant') return 'moderate risk'
      if (['major', 'catastrophic'].includes(c)) return 'Extreme risk'
    }
    if (l === 'almost certain') {
      if (c === 'insignificant') return 'moderate risk'
      if (c === 'minor') return 'High risk'
      if (c === 'moderate') return 'Extreme risk'
      if (['major', 'catastrophic'].includes(c)) return 'Extreme risk'
    }
    return 'Unknown'
  }

  // =========================
  // ADD RISK
  // =========================
  function openAddRiskModal() {
    setShowRiskModal(true)
    setIsEditing(false)
    setEditingRisk(null)
    setSelectedRiskTitleId(null)
    setRiskControlsForTitle([])
    setChosenControlIds([])
    setLikelihood('')
    setConsequences('')
    setNewControlText('')
    setLocalRiskRating('')
  }

  async function handlePickRiskTitle(riskTitleId: number) {
    setSelectedRiskTitleId(riskTitleId)
    try {
      const res = await axios.get(`/api/risks/${riskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
      setChosenControlIds([])
    } catch (err) {
      console.error(err)
      setMessage('Failed to load risk controls for chosen title.')
    }
  }

  function toggleChooseControl(ctrlId: number) {
    setChosenControlIds((prev) =>
      prev.includes(ctrlId)
        ? prev.filter((x) => x !== ctrlId)
        : [...prev, ctrlId]
    )
  }

  async function handleAddNewControl() {
    if (!selectedRiskTitleId || !newControlText.trim()) return
    try {
      await axios.post(`/api/risks/${selectedRiskTitleId}/controls`, {
        control_text: newControlText.trim(),
      })
      setNewControlText('')
      // Re-fetch the list
      const res = await axios.get(`/api/risks/${selectedRiskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new control.')
    }
  }

  // =========================
  // EDIT RISK
  // =========================
  // function openEditRiskModal(r: RiskRow) {
  //   setShowRiskModal(true)
  //   setIsEditing(true)
  //   setEditingRisk(r)

  //   setLikelihood(r.likelihood)
  //   setConsequences(r.consequences)
  //   setLocalRiskRating(r.risk_rating)
  //   setSelectedRiskTitleId(r.riskTitleId)

  //   // fetch controls for that riskTitle
  //   axios
  //     .get(`/api/risks/${r.riskTitleId}/controls`)
  //     .then((resp) => {
  //       setRiskControlsForTitle(resp.data)
  //       // find bridging for this risk specifically:
  //       // filter by "dc.risk_id === r.riskId"
  //       const relevant = detailedRiskControls.filter(
  //         (dc) => dc.risk_id === r.riskId
  //       )
  //       setChosenControlIds(relevant.map((rc) => rc.risk_control_id))
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //       setMessage('Failed to load controls for editing.')
  //     })
  //   setNewControlText('')
  // }

  // =========================
  // ADD RISK Title
  // =========================
  async function handleAddNewRiskTitle() {
    if (!newRiskTitle.trim()) return
    try {
      const res = await axios.post('/api/risk_titles', {
        title: newRiskTitle.trim(),
      })
      // After adding, reload the risk titles list
      await loadAllRiskTitles()
      // Optionally, auto-select the newly added risk title:
      setSelectedRiskTitleId(res.data.id)
      setNewRiskTitle('')
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new risk title.')
    }
  }

  // =========================
  // SAVE RISK
  // =========================
  async function handleSaveRisk() {
    if (!selectedRiskTitleId || !likelihood || !consequences) {
      setMessage('Please ensure all fields are filled.')
      return
    }

    try {
      if (!isEditing) {
        // -------- ADD MODE --------
        const createRes = await axios.post('/api/risks-create-row', {
          risk_title_id: selectedRiskTitleId,
          likelihood,
          consequences,
        })
        const newRiskId = createRes.data.riskId

        // Link risk to activity
        await axios.post('/api/activity_risks', {
          activity_id: activityId,
          risk_id: newRiskId,
        })

        // Link chosen controls
        for (const cid of chosenControlIds) {
          await axios.post('/api/activity_risk_controls', {
            activity_id: activityId,
            risk_id: newRiskId,
            risk_control_id: cid,
            is_checked: true,
          })
        }

        setMessage('Activity risk added successfully.')
      } else {
        // -------- EDIT MODE --------
        if (!editingRisk) return

        // get the new text for the risk_title
        const newTitle = allRiskTitles.find(
          (t) => t.id === selectedRiskTitleId
        )?.title
        if (!newTitle) {
          setMessage('Invalid risk title selected.')
          return
        }

        // Put to /risks/:riskId
        await axios.put(`/api/risks/${editingRisk.riskId}`, {
          title: newTitle,
          likelihood,
          consequences,
          chosenControlIds,
          activity_id: activityId,
        })

        setMessage('Activity risk updated successfully.')
      }

      setShowRiskModal(false)
      loadActivityRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage(isEditing ? 'Failed to update risk.' : 'Failed to add risk.')
    }
  }

  // =========================
  // REMOVE RISK
  // =========================
  async function handleRemoveRisk(r: RiskRow) {
    if (!window.confirm(`Remove risk "${r.risk_title_label}"?`)) return
    try {
      await axios.delete(
        `/api/activity_risks?activityId=${activityId}&riskId=${r.riskId}`
      )
      setMessage('Removed risk from activity.')
      loadActivityRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove risk.')
    }
  }

  // =========================
  // Hazards (unchanged)
  // =========================
  function openHazardModal(type: 'site' | 'activity') {
    setHazardTab(type)
    setSelectedHazardIds([])
    setShowHazardModal(true)
  }

  function closeHazardModal() {
    setShowHazardModal(false)
  }

  function toggleHazardSelected(hid: number) {
    setSelectedHazardIds((prev) =>
      prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]
    )
  }

  async function handleSaveHazards() {
    try {
      if (hazardTab === 'site') {
        for (const hid of selectedHazardIds) {
          await axios.post('/api/activity_site_hazards', {
            activity_id: activityId,
            site_hazard_id: hid,
          })
        }
      } else {
        for (const hid of selectedHazardIds) {
          await axios.post('/api/activity_activity_people_hazards', {
            activity_id: activityId,
            activity_people_hazard_id: hid,
          })
        }
      }
      setMessage('Hazards added successfully.')
      closeHazardModal()
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to save hazards.')
    }
  }

  async function handleRemoveSiteHazard(h: any) {
    if (!window.confirm(`Remove site hazard "${h.hazard_description}"?`)) return
    try {
      await axios.delete(`/api/activity_site_hazards?id=${h.id}`)
      setMessage('Removed site hazard.')
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove site hazard.')
    }
  }

  async function handleRemoveActivityHazard(h: any) {
    if (!window.confirm(`Remove activity hazard "${h.hazard_description}"?`))
      return
    try {
      await axios.delete(`/api/activity_activity_people_hazards?id=${h.id}`)
      setMessage('Removed activity hazard.')
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove activity hazard.')
    }
  }

  async function handleAddNewSiteHazard() {
    if (!newSiteHazard.trim()) return
    try {
      await axios.post('/api/site_hazards', {
        hazard_description: newSiteHazard.trim(),
      })
      setNewSiteHazard('')
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new site hazard.')
    }
  }

  async function handleAddNewActivityHazard() {
    if (!newActivityHazard.trim()) return
    try {
      await axios.post('/api/activity_people_hazards', {
        hazard_description: newActivityHazard.trim(),
      })
      setNewActivityHazard('')
      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new activity hazard.')
    }
  }

  // auto-hide alert
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  const riskTitleOptions: OptionType[] = allRiskTitles.map((rt) => ({
    value: rt.id,
    label: rt.title,
  }))

  function isOptionDisabled(option: OptionType) {
    // if we already have that risk title in activityRisks, disable
    const found = activityRisks.find((r) => r.risk_title_label === option.label)
    return !!found
  }
  //===================================================
  //// Render

  return (
    <div>
      <style>{inlineTabStyle}</style>

      {message && (
        <Alert variant="info" dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <h4
        style={{ fontWeight: 'bold', color: '#0094B6' }}
        className="mb-3 text-center"
      >
        Determine Hazards & 'Risk'for Activity
        {/* {activityName || '(Untitled)'} */}
      </h4>

      {/* Hazards */}
      <h4 style={{ color: '#0094B6' }} className="mt-4 fw-bold">
        Hazards
      </h4>
      <h6 className="p-3">
        Reminder: A hazard is anything that has the potential to cause harm or
        damage if we interact with it
      </h6>
      <Tabs
        activeKey={hazardTab}
        onSelect={(k) => {
          if (k === 'site' || k === 'activity') {
            setHazardTab(k)
          }
        }}
        className="mb-3 fw-bold"
      >
        <Tab eventKey="site" title="Site Hazards">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            style={{ backgroundColor: '#0094B6' }}
            onClick={() => openHazardModal('site')}
          >
            + Add Site Hazards
          </Button>

          <Table bordered striped hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activitySiteHazards.map((h: any) => (
                <tr key={h.id}>
                  <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {h.hazard_description}
                  </td>
                  <td>
                    <ButtonGroup>
                      <Button
                        style={{ backgroundColor: '#D37B49', color: 'white' }}
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveSiteHazard(h)}
                      >
                        Remove
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="activity" title="Activity/People Hazards">
          <Button
            style={{ backgroundColor: '#0094B6' }}
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => openHazardModal('activity')}
          >
            + Add Activity Hazards
          </Button>

          <Table bordered striped hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activityPeopleHazards.map((h: any) => (
                <tr key={h.id}>
                  <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {h.hazard_description}
                  </td>
                  <td>
                    <ButtonGroup>
                      <Button
                        style={{ backgroundColor: '#D37B49', color: 'white' }}
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveActivityHazard(h)}
                      >
                        Remove
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* Risks */}
      <h4 className="m-2 fw-bold" style={{ color: '#0094B6' }}>
        Risks
      </h4>
      <Button
        className="px-4"
        style={{ backgroundColor: '#0094B6' }}
        variant="primary"
        onClick={openAddRiskModal}
      >
        + Add Risk
      </Button>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Risk Title</th>
            <th>Selected Controls</th>
            <th>Likelihood</th>
            <th>Consequence</th>
            <th>Risk Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activityRisks.map((r) => {
            // filter the bridging to show only the controls for this risk
            const relevantControls = detailedRiskControls.filter(
              (dc) => dc.risk_id === r.riskId
            )
            return (
              <tr key={r.riskId}>
                <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {r.risk_title_label}
                </td>
                <td>
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    {relevantControls.map((c, idx) => (
                      <React.Fragment key={idx}>
                        <li
                          key={idx}
                          style={{ listStyleType: 'disc', marginBottom: '4px' }}
                        >
                          {c.control_text}
                        </li>
                        {/* <br /> */}
                      </React.Fragment>
                    ))}
                  </ul>
                </td>
                <td>{r.likelihood}</td>
                <td>{r.consequences}</td>
                <td>{r.risk_rating}</td>
                <td>
                  <ButtonGroup>
                    {/* <Button */}
                    {/* // style={{ backgroundColor: '#0094b6', */}
                    {/* //   color: 'white' }}

                      // variant="warning"
                      size="sm"
                      onClick={() => openEditRiskModal(r)}
                    >
                      {/* Edit */}
                    {/* </Button> */}
                    <Button
                      style={{ backgroundColor: '#D37B49', color: 'white' }}
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveRisk(r)}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {/* ADD/EDIT RISK MODAL */}
      <Modal show={showRiskModal} onHide={() => setShowRiskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#0094B6' }}>
            {isEditing ? 'Edit Activity Risk' : 'Add Activity Risk'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {!isEditing && (
            <Form.Group className="">
              <Form.Label>Risk Title</Form.Label>
              <Select
                options={riskTitleOptions}
                value={
                  selectedRiskTitleId
                    ? riskTitleOptions.find(
                        (op) => op.value === selectedRiskTitleId
                      )
                    : null
                }
                onChange={(option) => {
                  if (option) handlePickRiskTitle(option.value)
                  else setSelectedRiskTitleId(null)
                }}
                isOptionDisabled={(option) => isOptionDisabled(option)}
                placeholder="Select a Risk Title..."
                isClearable
              />
            </Form.Group>
          )}
          <Form.Group className="mb-4">
            <Form.Label></Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="You can add new risk title here, if you want..."
                value={newRiskTitle}
                onChange={(e) => setNewRiskTitle(e.target.value)}
              />
              <Button
                variant="success"
                onClick={handleAddNewRiskTitle}
                style={{ marginLeft: '6px' }}
              >
                +
              </Button>
            </div>
          </Form.Group>

          <div className="d-flex gap-3">
            <Form.Group className="mb-3 flex-fill">
              <Form.Label>Likelihood</Form.Label>
              <Form.Select
                value={likelihood}
                onChange={(e) => setLikelihood(e.target.value)}
              >
                <option value="">-- Select Likelihood --</option>
                <option>highly unlikely</option>
                <option>unlikely</option>
                <option>quite possible</option>
                <option>likely</option>
                <option>almost certain</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 flex-fill">
              <Form.Label>Consequence</Form.Label>
              <Form.Select
                value={consequences}
                onChange={(e) => setConsequences(e.target.value)}
              >
                <option value="">-- Select Consequence --</option>
                <option>insignificant</option>
                <option>minor</option>
                <option>moderate</option>
                <option>major</option>
                <option>catastrophic</option>
              </Form.Select>
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Risk Rating (auto-filled)</Form.Label>
            <Form.Control type="text" readOnly value={localRiskRating} />
          </Form.Group>

          {selectedRiskTitleId && (
            <div className="mb-3">
              <h5 style={{ color: '#0094B6' }}>Risk Controls</h5>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Check/uncheck the controls for this risk
              </p>
              <div
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '6px',
                  marginBottom: '0.5rem',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {riskControlsForTitle.map((ctrl) => (
                  <Form.Check
                    key={ctrl.id}
                    type="checkbox"
                    id={`ctrl-${ctrl.id}`}
                    label={ctrl.control_text}
                    checked={chosenControlIds.includes(ctrl.id)}
                    onChange={() => toggleChooseControl(ctrl.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                ))}
              </div>

              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Add new control text..."
                  value={newControlText}
                  onChange={(e) => setNewControlText(e.target.value)}
                />
                <Button variant="success" onClick={handleAddNewControl}>
                  +
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRiskModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRisk}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD HAZARDS MODAL */}
      <Modal show={showHazardModal} onHide={closeHazardModal}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#0094B6' }}>
            {hazardTab === 'site'
              ? 'Add Site Hazards'
              : 'Add Activity/People Hazards'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {/* Hazards unchanged */}
          {hazardTab === 'site' ? (
            <>
              {siteHazards.map((h) => {
                const isUsed = activitySiteHazards.some(
                  (sh: any) => sh.site_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`site-haz-${h.id}`}
                    type="checkbox"
                    label={
                      h.hazard_description + (isUsed ? ' (already added)' : '')
                    }
                    disabled={isUsed}
                    checked={selectedHazardIds.includes(h.id)}
                    onChange={() => toggleHazardSelected(h.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                )
              })}

              <div className="d-flex mt-3">
                <Form.Control
                  type="text"
                  placeholder="New site hazard description..."
                  value={newSiteHazard}
                  onChange={(e) => setNewSiteHazard(e.target.value)}
                />
                <Button
                  variant="success"
                  onClick={handleAddNewSiteHazard}
                  style={{ marginLeft: '6px' }}
                >
                  +
                </Button>
              </div>
            </>
          ) : (
            <>
              {activityHazards.map((h) => {
                const isUsed = activityPeopleHazards.some(
                  (ah: any) => ah.activity_people_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`act-haz-${h.id}`}
                    type="checkbox"
                    label={
                      h.hazard_description + (isUsed ? ' (already added)' : '')
                    }
                    disabled={isUsed}
                    checked={selectedHazardIds.includes(h.id)}
                    onChange={() => toggleHazardSelected(h.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                )
              })}

              <div className="d-flex mt-3">
                <Form.Control
                  type="text"
                  placeholder="New activity/people hazard..."
                  value={newActivityHazard}
                  onChange={(e) => setNewActivityHazard(e.target.value)}
                />
                <Button
                  variant="success"
                  onClick={handleAddNewActivityHazard}
                  style={{ marginLeft: '6px' }}
                >
                  +
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHazardModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveHazards}>
            Save Hazards
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ActivityRisk
