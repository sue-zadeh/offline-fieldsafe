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
import { 
  cacheRisks, 
  getCachedRisks, 
  cacheHazards, 
  getCachedHazards,
  saveOfflineItem,
  storeOfflineActivityData,
  getOfflineActivityData,
  cacheActivityAssignments,
  getCachedActivityAssignments,
  cacheRiskControlsForTitle,
  getCachedRiskControlsForTitle
} from '../utils/localDB'

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
    loadAllRiskTitles() // This will now also preload risk controls
    loadActivityRisks()
    loadDetailedRiskControls()
    loadAllHazards()
    loadActivityHazards()
  }, [activityId])

  // Debug effect to monitor siteHazards state changes
  useEffect(() => {
    console.log(`🔎 siteHazards state changed: ${siteHazards.length} items`, siteHazards.map(h => h.hazard_description))
  }, [siteHazards])

  useEffect(() => {
    console.log(`🔎 activityHazards state changed: ${activityHazards.length} items`, activityHazards.map(h => h.hazard_description))
  }, [activityHazards])

  // risk titles
  async function loadAllRiskTitles() {
    try {
      if (navigator.onLine) {
        const res = await axios.get('/api/risks')
        setAllRiskTitles(res.data)
        await cacheRisks(res.data)
        
        // After loading risk titles, preload their controls
        await preloadRiskControlsForTitles(res.data)
      } else {
        const cached = await getCachedRisks()
        setAllRiskTitles(cached)
        if (cached.length === 0) {
          setMessage('No risk titles available offline. Please connect to load data.')
        }
      }
    } catch (err) {
      console.error(err)
      // Try cached data on error
      try {
        const cached = await getCachedRisks()
        setAllRiskTitles(cached)
        if (cached.length === 0) {
          setMessage('Failed to load risk titles and no cached data available.')
        }
      } catch (cacheErr) {
        setMessage('Failed to load risk titles.')
      }
    }
  }

  // activity_risks bridging
  async function loadActivityRisks() {
    try {
      let onlineRisks: RiskRow[] = []
      
      if (navigator.onLine) {
        try {
          const res = await axios.get(
            `/api/activity_risks?activityId=${activityId}`
          )
          onlineRisks = res.data
          console.log(`✅ Loaded ${onlineRisks.length} risks from server`)
          
          // Cache server data for offline viewing
          await cacheActivityAssignments(activityId, 'risks', onlineRisks)
          console.log(`💾 Cached ${onlineRisks.length} risks for offline viewing`)
        } catch (err) {
          console.log('❌ Server request failed, trying cached data:', err)
          // If server fails, try cached historical data
          onlineRisks = await getCachedActivityAssignments(activityId, 'risks')
          console.log(`📚 Loaded ${onlineRisks.length} risks from cache`)
        }
      } else {
        // Offline: load cached historical data first
        onlineRisks = await getCachedActivityAssignments(activityId, 'risks')
        console.log(`📚 Offline: Loaded ${onlineRisks.length} historical risks from cache`)
      }
      
      // Always try to load offline risks and merge them
      const offlineRisks: RiskRow[] = await getOfflineActivityData(activityId, 'risks')
      console.log(`📦 Found ${offlineRisks.length} offline risk assignments`)
      
      // Merge cached/server and offline data (avoid duplicates)
      const allRiskIds = new Set(onlineRisks.map(r => r.riskId))
      const offlineOnlyRisks = offlineRisks.filter((r: RiskRow) => !allRiskIds.has(r.riskId))
      
      const allRisks = [...onlineRisks, ...offlineOnlyRisks]
      console.log(`📊 Total risk assignments: ${allRisks.length} (${onlineRisks.length} historical + ${offlineOnlyRisks.length} offline-only)`)
      setActivityRisks(allRisks)
      
      if (allRisks.length === 0 && !navigator.onLine) {
        setMessage('No activity risks found. Add risks which will sync when online.')
      }
    } catch (err) {
      console.error('❌ Error fetching activity risks:', err)
      setMessage('Failed to load activity risks.')
      
      // Final fallback to only offline data
      try {
        const offlineRisks: RiskRow[] = await getOfflineActivityData(activityId, 'risks')
        console.log(`🔄 Final fallback: Using ${offlineRisks.length} offline risks`)
        setActivityRisks(offlineRisks)
        if (offlineRisks.length > 0) {
          setMessage('Showing offline risks only. Connect to internet for full data.')
        }
      } catch (offlineErr) {
        console.error('❌ Error loading offline risks fallback:', offlineErr)
        setActivityRisks([])
      }
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

  // Preload all risk controls for offline use
  async function preloadRiskControlsForTitles(riskTitles: any[]) {
    console.log(`🎯 Preloading risk controls for ${riskTitles.length} risk titles...`)
    
    try {
      if (navigator.onLine) {
        // Load all unique risk controls by fetching controls for each risk title
        for (const riskTitle of riskTitles) {
          try {
            const res = await axios.get(`/api/risks/${riskTitle.id}/controls`)
            await cacheRiskControlsForTitle(riskTitle.id, res.data)
            console.log(`💾 Cached ${res.data.length} controls for "${riskTitle.risk_title}"`)
            
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (err) {
            console.log(`⚠️ Failed to preload controls for risk title ${riskTitle.id}:`, err)
          }
        }
        console.log('✅ Finished preloading risk controls')
      } else {
        console.log('📱 Offline mode - skipping risk controls preload')
      }
    } catch (err) {
      console.log('❌ Error during risk controls preload:', err)
    }
  }

  // hazards
  async function loadAllHazards() {
    console.log(`🔍 Loading hazards, online: ${navigator.onLine}`)
    
    try {
      let siteHazardsData: Hazard[] = []
      let activityHazardsData: Hazard[] = []
      
      if (navigator.onLine) {
        try {
          const [siteRes, actRes] = await Promise.all([
            axios.get('/api/site_hazards'),
            axios.get('/api/activity_people_hazards')
          ])
          
          siteHazardsData = siteRes.data
          activityHazardsData = actRes.data
          console.log(`✅ Loaded ${siteHazardsData.length} site hazards, ${activityHazardsData.length} activity hazards from server`)

          // Cache hazards for offline use with type markers
          const allHazards = [
            ...siteHazardsData.map(h => ({ ...h, type: 'site' })),
            ...activityHazardsData.map(h => ({ ...h, type: 'activity' }))
          ]
          await cacheHazards(allHazards)
          console.log(`💾 Cached ${allHazards.length} hazards for offline viewing`)
        } catch (err) {
          console.log('❌ Server request failed, trying cached data:', err)
          const cached = await getCachedHazards()
          
          // Smart filtering based on known hazard patterns from database
          const siteHazardKeywords = ['Slippery', 'Weather', 'Terrain', 'Surface', 'Environmental', 'Obstacle']
          const activityHazardKeywords = ['Fatigue', 'Training', 'Lifting', 'Physical', 'Human', 'Personnel']
          
          siteHazardsData = cached.filter(h => {
            // If it has explicit type, use it
            if (h.type === 'site') return true
            if (h.type === 'activity') return false
            
            // Otherwise, check the description for keywords
            const desc = h.hazard_description || ''
            const isSite = siteHazardKeywords.some(keyword => desc.includes(keyword))
            const isActivity = activityHazardKeywords.some(keyword => desc.includes(keyword))
            
            // Default to site if not clearly activity
            return !isActivity || isSite
          })
          
          activityHazardsData = cached.filter(h => {
            // If it has explicit type, use it
            if (h.type === 'activity') return true
            if (h.type === 'site') return false
            
            // Otherwise, check the description for keywords
            const desc = h.hazard_description || ''
            return activityHazardKeywords.some(keyword => desc.includes(keyword))
          })
          
          console.log(`📚 Smart-filtered: ${siteHazardsData.length} site + ${activityHazardsData.length} activity hazards from cache`)
        }
      } else {
        console.log('📱 Offline mode - loading from cache...')
        const cached = await getCachedHazards()
        
        // Use the same smart filtering logic for offline mode
        const siteHazardKeywords = ['Slippery', 'Weather', 'Terrain', 'Surface', 'Environmental', 'Obstacle']
        const activityHazardKeywords = ['Fatigue', 'Training', 'Lifting', 'Physical', 'Human', 'Personnel']
        
        siteHazardsData = cached.filter(h => {
          // If it has explicit type, use it
          if (h.type === 'site') return true
          if (h.type === 'activity') return false
          
          // Otherwise, check the description for keywords
          const desc = h.hazard_description || ''
          const isSite = siteHazardKeywords.some(keyword => desc.includes(keyword))
          const isActivity = activityHazardKeywords.some(keyword => desc.includes(keyword))
          
          // Default to site if not clearly activity
          return !isActivity || isSite
        })
        
        activityHazardsData = cached.filter(h => {
          // If it has explicit type, use it
          if (h.type === 'activity') return true
          if (h.type === 'site') return false
          
          // Otherwise, check the description for keywords
          const desc = h.hazard_description || ''
          return activityHazardKeywords.some(keyword => desc.includes(keyword))
        })
        
        console.log(`📚 Offline smart-filtered: ${siteHazardsData.length} site + ${activityHazardsData.length} activity hazards from cache`)
        
        if (cached.length === 0) {
          setMessage('No hazard definitions available offline.')
        }
      }
      
      setSiteHazards(siteHazardsData)
      setActivityHazards(activityHazardsData)
      
      console.log(`🎯 Final state set - Site hazards:`, siteHazardsData.map(h => h.hazard_description))
      console.log(`🎯 Final state set - Activity hazards:`, activityHazardsData.map(h => h.hazard_description))
      
    } catch (err) {
      console.error('❌ Error loading hazards:', err)
      try {
        const cached = await getCachedHazards()
        setSiteHazards(cached.filter(h => h.type === 'site' || !h.type))
        setActivityHazards(cached.filter(h => h.type === 'activity'))
        console.log(`🔄 Fallback: Using ${cached.length} cached hazards`)
      } catch (cacheErr) {
        console.error('❌ Error loading cached hazards:', cacheErr)
        setMessage('Failed to load hazard definitions.')
      }
    }
  }

  async function loadActivityHazards() {
    try {
      let siteHazards: any[] = []
      let peopleHazards: any[] = []
      
      if (navigator.onLine) {
        // Online: get from server
        try {
          const shRes = await axios.get(
            `/api/activity_site_hazards?activityId=${activityId}`
          )
          siteHazards = shRes.data
          console.log(`✅ Loaded ${siteHazards.length} site hazards from server`)

          const ahRes = await axios.get(
            `/api/activity_activity_people_hazards?activityId=${activityId}`
          )
          peopleHazards = ahRes.data
          console.log(`✅ Loaded ${peopleHazards.length} people hazards from server`)
          
          // Cache server data for offline viewing
          await cacheActivityAssignments(activityId, 'site_hazards', siteHazards)
          await cacheActivityAssignments(activityId, 'people_hazards', peopleHazards)
          console.log(`💾 Cached hazards for offline viewing`)
        } catch (err) {
          console.log('❌ Server request failed, trying cached data:', err)
          // If server fails, try cached historical data
          siteHazards = await getCachedActivityAssignments(activityId, 'site_hazards')
          peopleHazards = await getCachedActivityAssignments(activityId, 'people_hazards')
          console.log(`📚 Loaded ${siteHazards.length} site + ${peopleHazards.length} people hazards from cache`)
        }
      } else {
        // Offline: load cached historical data first
        siteHazards = await getCachedActivityAssignments(activityId, 'site_hazards')
        peopleHazards = await getCachedActivityAssignments(activityId, 'people_hazards')
        console.log(`📚 Offline: Loaded ${siteHazards.length} site + ${peopleHazards.length} people hazards from cache`)
      }
      
      // Always load offline hazards and merge them
      const offlineSiteHazards = await getOfflineActivityData(activityId, 'site_hazards')
      const offlinePeopleHazards = await getOfflineActivityData(activityId, 'people_hazards')
      console.log(`📦 Found ${offlineSiteHazards.length} offline site + ${offlinePeopleHazards.length} offline people hazards`)
      
      // Merge cached/server and offline data (avoid duplicates)
      const allSiteIds = new Set(siteHazards.map(h => h.id))
      const allPeopleIds = new Set(peopleHazards.map(h => h.id))
      
      const offlineOnlySiteHazards = offlineSiteHazards.filter((h: any) => !allSiteIds.has(h.id))
      const offlineOnlyPeopleHazards = offlinePeopleHazards.filter((h: any) => !allPeopleIds.has(h.id))
      
      const finalSiteHazards = [...siteHazards, ...offlineOnlySiteHazards]
      const finalPeopleHazards = [...peopleHazards, ...offlineOnlyPeopleHazards]
      
      console.log(`📊 Total hazards: ${finalSiteHazards.length} site (${siteHazards.length} historical + ${offlineOnlySiteHazards.length} offline-only)`)
      console.log(`📊 Total hazards: ${finalPeopleHazards.length} people (${peopleHazards.length} historical + ${offlineOnlyPeopleHazards.length} offline-only)`)
      
      setActivitySiteHazards(finalSiteHazards)
      setActivityPeopleHazards(finalPeopleHazards)
      
    } catch (err) {
      console.error('❌ Error loading activity hazards:', err)
      // Final fallback to only offline data
      try {
        const offlineSiteHazards = await getOfflineActivityData(activityId, 'site_hazards')
        const offlinePeopleHazards = await getOfflineActivityData(activityId, 'people_hazards')
        console.log(`🔄 Final fallback: Using ${offlineSiteHazards.length} offline site + ${offlinePeopleHazards.length} offline people hazards`)
        setActivitySiteHazards(offlineSiteHazards)
        setActivityPeopleHazards(offlinePeopleHazards)
      } catch (offlineErr) {
        console.error('❌ Error loading offline hazards:', offlineErr)
        setMessage('Failed to load hazards for this activity.')
      }
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
    console.log(`🎯 Loading risk controls for risk title ${riskTitleId}...`)
    setSelectedRiskTitleId(riskTitleId)
    
    try {
      const res = await axios.get(`/api/risks/${riskTitleId}/controls`)
      console.log(`✅ Loaded ${res.data.length} risk controls from server`)
      setRiskControlsForTitle(res.data)
      setChosenControlIds([])
      
      // Cache the controls for offline use
      await cacheRiskControlsForTitle(riskTitleId, res.data)
      console.log(`💾 Cached risk controls for title ${riskTitleId}`)
    } catch (err) {
      console.log(`❌ Server request failed, trying cached controls for title ${riskTitleId}:`, err)
      
      // Try to get cached controls for this specific risk title
      const cachedControls = await getCachedRiskControlsForTitle(riskTitleId)
      if (cachedControls.length > 0) {
        console.log(`📚 Found ${cachedControls.length} cached controls for risk title ${riskTitleId}`)
        setRiskControlsForTitle(cachedControls)
        setChosenControlIds([])
      } else {
        console.log(`⚠️ No cached controls found for risk title ${riskTitleId}`)
        setRiskControlsForTitle([])
        setMessage('Failed to load risk controls. Please try again when online.')
      }
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
    console.log(`➕ Adding new risk control for title ${selectedRiskTitleId}: "${newControlText.trim()}"`)
    
    try {
      await axios.post(`/api/risks/${selectedRiskTitleId}/controls`, {
        control_text: newControlText.trim(),
      })
      setNewControlText('')
      console.log(`✅ Added new control successfully`)
      
      // Re-fetch the list
      const res = await axios.get(`/api/risks/${selectedRiskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
      
      // Update cache
      await cacheRiskControlsForTitle(selectedRiskTitleId, res.data)
      console.log(`💾 Updated cached risk controls for title ${selectedRiskTitleId}`)
    } catch (err) {
      console.log(`❌ Failed to add new control (offline mode):`, err)
      
      // In offline mode, add to local list temporarily
      const newControl = {
        id: Date.now(), // Temporary ID
        control_text: newControlText.trim(),
        risk_title_id: selectedRiskTitleId,
        temp: true // Mark as temporary
      }
      
      const updatedControls = [...riskControlsForTitle, newControl]
      setRiskControlsForTitle(updatedControls)
      setNewControlText('')
      
      // Cache the updated list
      await cacheRiskControlsForTitle(selectedRiskTitleId, updatedControls)
      console.log(`📝 Added control locally (offline), will sync when online`)
      setMessage('Control added locally. Will sync when online.')
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
        if (navigator.onLine) {
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
          // Offline mode - save for later sync
          await saveOfflineItem({
            type: 'activity_risk',
            data: {
              activity_id: activityId,
              risk_title_id: selectedRiskTitleId,
              likelihood,
              consequences,
              chosen_control_ids: chosenControlIds,
              timestamp: Date.now()
            },
            synced: false,
            timestamp: Date.now()
          })

          // Add to local state immediately for display
          const riskTitle = allRiskTitles.find(r => r.id === selectedRiskTitleId)
          if (riskTitle) {
            const tempId = Date.now() // Temporary ID for offline
            const newRisk: RiskRow = {
              activityRiskId: tempId,
              riskId: tempId,
              riskTitleId: selectedRiskTitleId,
              risk_title_label: riskTitle.title,
              likelihood: likelihood,
              consequences: consequences,
              risk_rating: 'Pending', // Will be calculated when synced
            }
            setActivityRisks(prev => [...prev, newRisk])
            
            // Store offline risks for persistence
            await storeOfflineActivityData(activityId, 'risks', [...activityRisks, newRisk])
          }

          setMessage('Risk saved offline and will sync when online.')
        }
      } else {
        // -------- EDIT MODE --------
        if (!navigator.onLine) {
          setMessage('Editing risks is not available in offline mode.')
          return
        }

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
    if (!navigator.onLine) {
      setMessage('Remove functionality is not available in offline mode.')
      return
    }
    
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
      if (navigator.onLine) {
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
      } else {
        // Offline mode - save for later sync
        const selectedHazards = hazardTab === 'site' ? siteHazards : activityHazards
        for (const hid of selectedHazardIds) {
          await saveOfflineItem({
            type: 'activity_hazard',
            data: {
              activity_id: activityId,
              hazard_id: hid,
              hazard_type: hazardTab,
              timestamp: Date.now()
            },
            synced: false,
            timestamp: Date.now()
          })
        }

        // Add to local state immediately for display
        const newHazards = selectedHazards.filter(h => selectedHazardIds.includes(h.id))
        if (hazardTab === 'site') {
          const updatedSiteHazards = [...activitySiteHazards, ...newHazards]
          setActivitySiteHazards(updatedSiteHazards)
          // Store offline site hazards for persistence
          await storeOfflineActivityData(activityId, 'site_hazards', updatedSiteHazards)
        } else {
          const updatedPeopleHazards = [...activityPeopleHazards, ...newHazards]
          setActivityPeopleHazards(updatedPeopleHazards)
          // Store offline people hazards for persistence
          await storeOfflineActivityData(activityId, 'people_hazards', updatedPeopleHazards)
        }

        setMessage('Hazards saved offline and will sync when online.')
      }
      
      closeHazardModal()
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to save hazards.')
    }
  }

  async function handleRemoveSiteHazard(h: any) {
    if (!navigator.onLine) {
      setMessage('Remove functionality is not available in offline mode.')
      return
    }
    
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
    if (!navigator.onLine) {
      setMessage('Remove functionality is not available in offline mode.')
      return
    }
    
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

      {isOffline && (
        <div className="alert alert-warning text-center mb-3" role="alert">
          <strong>Offline Mode:</strong> You can add risks and hazards offline. Remove functionality is disabled.
        </div>
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
                        disabled={isOffline}
                        title={isOffline ? 'Remove functionality not available offline' : ''}
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
                        disabled={isOffline}
                        title={isOffline ? 'Remove functionality not available offline' : ''}
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
                      disabled={isOffline}
                      title={isOffline ? 'Remove functionality not available offline' : ''}
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
