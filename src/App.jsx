import { useState, useEffect, useRef } from 'react'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts'
import { db, storage, auth } from './firebase'
import { validateDescription } from './utils'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'

function App() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState('home') // 'home' | 'form' | 'success' | 'admin-login' | 'admin-dashboard'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])
  
  // Public Form States
  const [formData, setFormData] = useState({
    category: 'Umum',
    description: '',
    location: '',
    locationId: null,
    isAnonymous: false,
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [referenceId, setReferenceId] = useState('')

  // Auth States
  const [adminUser, setAdminUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Locations States
  const [locations, setLocations] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [newLocName, setNewLocName] = useState('')
  const [newLocId, setNewLocId] = useState('')
  const [creatingLocation, setCreatingLocation] = useState(false)
  const [filterLocation, setFilterLocation] = useState('All')

  // Dashboard Navigation Tab
  const [dashboardTab, setDashboardTab] = useState('list') // 'list' | 'analytics' | 'locations'

  // Dashboard States
  const [feedbacks, setFeedbacks] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [editStatus, setEditStatus] = useState('new')
  const [editCategory, setEditCategory] = useState('Umum')
  const [editPriority, setEditPriority] = useState('medium')
  const [editAdminNotes, setEditAdminNotes] = useState('')
  const [updatingFeedback, setUpdatingFeedback] = useState(false)

  // Penapis (Filters)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')

  // Notification badge state for new high priority feedbacks
  const [highPriorityNotification, setHighPriorityNotification] = useState(false)

  // General States
  const [error, setError] = useState(null)

  const fileInputRef = useRef(null)

  // Colors for charts
  const PIE_COLORS = ['#38bdf8', '#fbbf24', '#34d399'] // blue, amber, emerald

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true)
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid)
          const adminDocSnap = await getDoc(adminDocRef)
          
          if (adminDocSnap.exists()) {
            setAdminUser({ uid: user.uid, email: user.email, ...adminDocSnap.data() })
            setPage('admin-dashboard')
          } else {
            setError('Akses ditolak. Pengguna ini bukan admin berdaftar.')
            await signOut(auth)
            setAdminUser(null)
            setPage('admin-login')
          }
        } catch (err) {
          console.error('Error verifying admin status:', err)
          setError('Ralat memverifikasi status admin.')
          setPage('admin-login')
        }
      } else {
        setAdminUser(null)
        if (page === 'admin-dashboard') {
          setPage('admin-login')
        }
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [page])

  // 2. Real-time Feedback Subscription
  useEffect(() => {
    if (!adminUser) return

    const feedbackColRef = collection(db, 'feedback')
    const q = query(feedbackColRef, orderBy('submittedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = []
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() })
      })

      const newHighPriority = docs.filter(f => f.status === 'new' && f.priority === 'high')
      if (newHighPriority.length > 0) {
        setHighPriorityNotification(true)
      } else {
        setHighPriorityNotification(false)
      }

      setFeedbacks(docs)
    }, (err) => {
      console.error('Error loading feedbacks:', err)
    })

    return () => unsubscribe()
  }, [adminUser])

  // 3. Subscription to locations
  useEffect(() => {
    const locationsColRef = collection(db, 'locations')
    const unsubscribe = onSnapshot(locationsColRef, (snapshot) => {
      const locs = []
      snapshot.forEach((doc) => {
        locs.push({ id: doc.id, ...doc.data() })
      })
      setLocations(locs)
    }, (err) => {
      console.error('Error listening to locations:', err)
    })
    return () => unsubscribe()
  }, [])

  // 4. Handle loc parameter detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const locId = params.get('loc')
    if (locId) {
      const locRef = doc(db, 'locations', locId)
      getDoc(locRef).then((snap) => {
        if (snap.exists() && snap.data().active) {
          const locData = snap.data()
          setCurrentLocation({ id: locId, ...locData })
          setFormData(prev => ({
            ...prev,
            locationId: locId,
            location: locData.name
          }))
          setPage('form')
        }
      }).catch((err) => {
        console.error('Error fetching location from QR code URL:', err)
      })
    }
  }, [])

  useEffect(() => {
    if (selectedFeedback) {
      setEditStatus(selectedFeedback.status || 'new')
      setEditCategory(selectedFeedback.category || 'Umum')
      setEditPriority(selectedFeedback.priority || 'medium')
      setEditAdminNotes(selectedFeedback.adminNotes || '')
    }
  }, [selectedFeedback])

  // Public Form Inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handle Photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Sila pilih fail imej sahaja (PNG, JPG, JPEG).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Saiz imej mestilah kurang daripada 5MB.')
      return
    }

    setError(null)
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    
    const validation = validateDescription(formData.description, t)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const feedbackColRef = collection(db, 'feedback')
      const newFeedbackDocRef = doc(feedbackColRef)
      const feedbackId = newFeedbackDocRef.id

      let uploadedPhotoUrl = null

      if (photo) {
        const fileExtension = photo.name.split('.').pop()
        const storagePath = `feedback_photos/${feedbackId}.${fileExtension}`
        const storageRef = ref(storage, storagePath)
        
        await uploadBytes(storageRef, photo, { contentType: photo.type })
        uploadedPhotoUrl = await getDownloadURL(storageRef)
      }

      const feedbackData = {
        id: feedbackId,
        category: formData.category,
        priority: 'medium', 
        description: formData.description.trim(),
        photoUrl: uploadedPhotoUrl,
        location: formData.location.trim() || null,
        locationId: formData.locationId || null,
        status: 'new',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: null,
        isAnonymous: formData.isAnonymous,
      }

      await setDoc(newFeedbackDocRef, feedbackData)

      setReferenceId(feedbackId)
      setPage('success')
      
      setFormData({
        category: 'Umum',
        description: '',
        location: '',
        locationId: null,
        isAnonymous: false,
      })
      setPhoto(null)
      setPhotoPreview(null)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Gagal menghantar maklum balas. Sila cuba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Admin SignIn
  const handleAdminSignIn = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Sila masukkan emel dan kata laluan.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      console.error('Error signing in:', err)
      setError('Emel atau kata laluan salah. Sila cuba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminSignOut = async () => {
    setError(null)
    try {
      await signOut(auth)
      setAdminUser(null)
      setSelectedFeedback(null)
      setPage('home')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  // Update Feedback (Admin actions)
  const handleUpdateFeedback = async (e) => {
    e.preventDefault()
    if (!selectedFeedback) return

    setUpdatingFeedback(true)
    setError(null)

    try {
      const feedbackDocRef = doc(db, 'feedback', selectedFeedback.id)
      await updateDoc(feedbackDocRef, {
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        adminNotes: editAdminNotes.trim() || null,
        updatedAt: serverTimestamp()
      })

      setSelectedFeedback(prev => ({
        ...prev,
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        adminNotes: editAdminNotes.trim() || null,
      }))
    } catch (err) {
      console.error('Error updating feedback:', err)
      setError('Gagal mengemas kini maklum balas.')
    } finally {
      setUpdatingFeedback(false)
    }
  }

  // Admin Locations Actions
  const handleLocNameChange = (e) => {
    const val = e.target.value
    setNewLocName(val)
    const generatedId = val.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
    setNewLocId(generatedId)
  }

  const handleAddLocation = async (e) => {
    e.preventDefault()
    if (!newLocName.trim() || !newLocId.trim()) return

    const sanitizedId = newLocId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    
    const exists = locations.some(l => l.id === sanitizedId)
    if (exists) {
      setError(t('locations.err_exists'))
      return
    }

    setCreatingLocation(true)
    setError(null)

    try {
      const qrUrl = `${window.location.origin}/aduan?loc=${sanitizedId}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 350, margin: 2 })
      
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()

      const qrStorageRef = ref(storage, `qr_codes/${sanitizedId}.png`)
      await uploadBytes(qrStorageRef, blob, { contentType: 'image/png' })
      const downloadUrl = await getDownloadURL(qrStorageRef)

      const locDocRef = doc(db, 'locations', sanitizedId)
      await setDoc(locDocRef, {
        id: sanitizedId,
        name: newLocName.trim(),
        qrCodeUrl: downloadUrl,
        active: true,
        createdAt: serverTimestamp()
      })

      setNewLocName('')
      setNewLocId('')
      setError(null)
    } catch (err) {
      console.error('Error creating location and uploading QR:', err)
      setError(t('common.error_occurred', 'Ralat berlaku. Sila cuba lagi.'))
    } finally {
      setCreatingLocation(false)
    }
  }

  const handleToggleLocationStatus = async (loc) => {
    try {
      const locRef = doc(db, 'locations', loc.id)
      await updateDoc(locRef, {
        active: !loc.active
      })
    } catch (err) {
      console.error('Error updating location status:', err)
    }
  }

  const handleDownloadQR = async (loc) => {
    try {
      const response = await fetch(loc.qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr_${loc.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading QR code:', err)
    }
  }

  // Aggregation logic for Analytics Charts
  const getCategoryChartData = () => {
    const categories = ['Makanan', 'Kebersihan', 'Kemudahan', 'Perkhidmatan', 'Umum']
    return categories.map(cat => ({
      name: t(`categories.${cat}`, cat),
      Jumlah: feedbacks.filter(f => f.category === cat).length
    }))
  }

  const getStatusChartData = () => {
    return [
      { name: t('admin.status_new'), value: feedbacks.filter(f => f.status === 'new').length },
      { name: t('admin.status_under_review'), value: feedbacks.filter(f => f.status === 'under_review').length },
      { name: t('admin.status_resolved'), value: feedbacks.filter(f => f.status === 'resolved').length },
    ].filter(item => item.value > 0)
  }

  const getTrendChartData = () => {
    const monthlyData = {}
    
    feedbacks.forEach(f => {
      if (!f.submittedAt) return
      const date = f.submittedAt.toDate ? f.submittedAt.toDate() : new Date(f.submittedAt)
      const monthNames = [
        t('months.Jan', 'Jan'), t('months.Feb', 'Feb'), t('months.Mac', 'Mac'),
        t('months.Apr', 'Apr'), t('months.Mei', 'Mei'), t('months.Jun', 'Jun'),
        t('months.Jul', 'Jul'), t('months.Ogo', 'Ogo'), t('months.Sep', 'Sep'),
        t('months.Okt', 'Okt'), t('months.Nov', 'Nov'), t('months.Dis', 'Dis')
      ]
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      const sortKey = date.getFullYear() * 12 + date.getMonth()
      
      if (!monthlyData[key]) {
        monthlyData[key] = { name: key, Jumlah: 0, sortKey }
      }
      monthlyData[key].Jumlah += 1
    })
    
    return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey)
  }

  const getLocationChartData = () => {
    const locationCounts = {}
    
    feedbacks.forEach(f => {
      let locName = t('locations.fallback_manual', 'Akses Terus / Tiada QR')
      if (f.locationId) {
        const found = locations.find(l => l.id === f.locationId)
        if (found) locName = found.name
      } else if (f.location) {
        locName = f.location
      }
      
      if (!locationCounts[locName]) {
        locationCounts[locName] = 0
      }
      locationCounts[locName] += 1
    })
    
    return Object.entries(locationCounts).map(([name, count]) => ({
      name,
      Jumlah: count
    }))
  }

  // Stats summaries
  const totalCount = feedbacks.length
  const newCount = feedbacks.filter(f => f.status === 'new').length
  const reviewCount = feedbacks.filter(f => f.status === 'under_review').length
  const resolvedCount = feedbacks.filter(f => f.status === 'resolved').length
  const highPriorityCount = feedbacks.filter(f => f.status === 'new' && f.priority === 'high').length

  const formatTime = (ts) => {
    if (!ts) return '-'
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleString('ms-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchStatus = filterStatus === 'All' || fb.status === filterStatus
    const matchCategory = filterCategory === 'All' || fb.category === filterCategory
    const matchPriority = filterPriority === 'All' || fb.priority === filterPriority
    const matchLocation = filterLocation === 'All' || fb.locationId === filterLocation || (filterLocation === 'manual' && !fb.locationId)
    return matchStatus && matchCategory && matchPriority && matchLocation
  })

  // Badge stylings
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{t('admin.status_new')}</span>
      case 'under_review':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{t('admin.status_under_review')}</span>
      case 'resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('admin.status_resolved')}</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/30">{t('admin.priority_high')}</span>
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{t('admin.priority_medium')}</span>
      case 'low':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{t('admin.priority_low')}</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{priority}</span>
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />

      {/* Header bar */}
      <header className="relative border-b border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 transition-colors duration-300">
        <div 
          onClick={() => { if (!adminUser) setPage('home'); }}
          className={`flex items-center gap-3 ${!adminUser ? 'cursor-pointer' : ''}`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <span className="font-bold text-lg font-display tracking-tight text-slate-900 dark:text-white">
            Feedback Kafe
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Togol Dark/Light Mode */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={theme === 'dark' ? t('common.light_mode', 'Mod Terang') : t('common.dark_mode', 'Mod Gelap')}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 17.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm2.122-14.142a1 1 0 111.414 1.414L7.88 5.93a1 1 0 11-1.414-1.414l.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Togol Bahasa (BM / EN) */}
          <div className="flex items-center bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 rounded-lg p-0.5 transition-colors duration-300">
            <button
              onClick={() => i18n.changeLanguage('ms')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                i18n.language === 'ms'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              BM
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                i18n.language === 'en'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {adminUser ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{adminUser.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500">{adminUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <button
                onClick={handleAdminSignOut}
                className="px-4 py-1.5 bg-white dark:bg-slate-900 hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-500 font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-800 hover:border-red-500/20"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            page !== 'admin-login' && (
              <button
                onClick={() => {
                  setError(null);
                  setPage('admin-login');
                }}
                className="px-4 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-800"
              >
                {t('common.admin_portal')}
              </button>
            )
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 relative z-0">
        
        {authLoading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-slate-500">{t('common.loading', 'Mengesahkan sesi...')}</p>
          </div>
        ) : (
          <>
            {/* Screen 1: Welcome Page */}
            {page === 'home' && (
              <div className="max-w-xl w-full text-center space-y-8 glass-card p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl animate-fade-in my-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-xl shadow-sky-500/10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-display">
                    {t('form.welcome_title')}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-md mx-auto font-light leading-relaxed">
                    {t('form.welcome_subtitle')}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setError(null);
                      setPage('form');
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/15 hover:shadow-sky-500/35 active:scale-[0.98]"
                  >
                    {t('form.submit_feedback_btn')}
                  </button>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800/40 flex justify-between text-xs text-slate-500">
                  <span>{t('form.easy_qr', 'Akses QR Mudah')}</span>
                  <span>TVET MARA Besut</span>
                </div>
              </div>
            )}

            {/* Screen 2: Feedback Form */}
            {page === 'form' && (
              <div className="max-w-lg w-full glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {t('form.title')}
                  </h2>
                  <button
                    onClick={() => {
                      setPage('home');
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('form.category')}
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 text-base cursor-pointer bg-white dark:bg-slate-900"
                    >
                      <option value="Umum" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Umum')}</option>
                      <option value="Makanan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Makanan')}</option>
                      <option value="Kebersihan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Kebersihan')}</option>
                      <option value="Kemudahan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Kemudahan')}</option>
                      <option value="Perkhidmatan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Perkhidmatan')}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="description" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t('form.description')} <span className="text-sky-500">*</span>
                      </label>
                      <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
                        {formData.description.length}/500
                      </span>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      maxLength="500"
                      placeholder={t('form.description_placeholder')}
                      className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
                    />
                  </div>

                  {currentLocation ? (
                    <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-sm font-medium flex items-center gap-3">
                      <svg className="w-5 h-5 animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <span className="block text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">{t('locations.prefilled_info')}</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{currentLocation.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label htmlFor="location" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t('form.location')}
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder={t('form.location_placeholder')}
                        className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                      {t('form.photo')}
                    </label>
                    
                    {!photoPreview ? (
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-sky-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-100/50 dark:bg-slate-950/20"
                      >
                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t('form.photo_select', 'Klik untuk pilih gambar')}</span>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/50 p-2 flex items-center gap-4">
                        <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{photo.name}</p>
                          <p className="text-[10px] text-slate-500">{(photo.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                          title={t('form.photo_remove')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      id="isAnonymous"
                      name="isAnonymous"
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-white dark:focus:ring-offset-slate-950 bg-white dark:bg-slate-950"
                    />
                    <label htmlFor="isAnonymous" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      {t('form.anonymous')}
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-900">
                    <button
                      type="button"
                      onClick={() => setPage('home')}
                      className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-300 dark:border-slate-800 font-medium"
                    >
                      {t('form.back_btn')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 btn-primary flex justify-center items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('form.submitting')}
                        </>
                      ) : t('form.submit_btn')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Screen 3: Success Screen */}
            {page === 'success' && (
              <div className="max-w-md w-full text-center space-y-6 glass-card p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl animate-fade-in my-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {t('form.success_title')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {t('form.success_desc')}
                  </p>
                </div>

                <div className="bg-slate-100/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    {t('form.ref_id')}
                  </span>
                  <div className="font-mono text-base font-semibold text-sky-600 dark:text-sky-400 select-all">
                    {referenceId}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {t('form.ref_id_sub')}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setPage('form')}
                    className="w-full btn-primary py-3 flex justify-center items-center"
                  >
                    {t('form.new_submission_btn')}
                  </button>
                </div>
              </div>
            )}

            {/* Screen 4: Admin Login Screen */}
            {page === 'admin-login' && (
              <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                    {t('login.title')}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {t('login.subtitle', 'Sila log masuk menggunakan emel dan kata laluan admin anda.')}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('login.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="admin@kafe-tvet.com"
                      className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('login.password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('');
                        setLoginPassword('');
                        setError(null);
                        setPage('home');
                      }}
                      className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-300 dark:border-slate-800 font-medium"
                    >
                      {t('form.back_btn')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 btn-primary flex justify-center items-center"
                    >
                      {submitting ? t('common.loading') : t('login.submit')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Screen 5: Admin Dashboard Screen */}
            {page === 'admin-dashboard' && adminUser && (
              <div className="w-full max-w-7xl flex flex-col space-y-6 my-6 min-h-[calc(100vh-160px)] animate-fade-in">
                
                {/* Stats Summary Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_total')}</span>
                      <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_new')}</span>
                      <p className="text-2xl font-bold text-blue-400 mt-1">{newCount}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_under_review')}</span>
                      <p className="text-2xl font-bold text-amber-400 mt-1">{reviewCount}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_resolved')}</span>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dashboard Tab Navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-900 gap-2">
                  <button
                    onClick={() => setDashboardTab('list')}
                    className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${
                      dashboardTab === 'list' 
                        ? 'border-sky-500 text-sky-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('admin.nav_list')} ({filteredFeedbacks.length})
                  </button>
                  <button
                    onClick={() => setDashboardTab('analytics')}
                    className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${
                      dashboardTab === 'analytics' 
                        ? 'border-sky-500 text-sky-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('admin.nav_reports')}
                  </button>
                  <button
                    onClick={() => setDashboardTab('locations')}
                    className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${
                      dashboardTab === 'locations' 
                        ? 'border-sky-500 text-sky-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('locations.title')}
                  </button>
                </div>

                {/* TAB 1: LIST VIEW */}
                {dashboardTab === 'list' && (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side: List View & Filters */}
                    <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 shadow-2xl p-6 flex flex-col space-y-6">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                        <div>
                          <h2 className="text-xl font-bold font-display text-white">
                            {t('admin.dashboard_title')}
                          </h2>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {t('admin.dashboard_subtitle', 'Memaparkan aduan dari pengguna secara masa nyata.')}
                          </p>
                        </div>

                        {highPriorityNotification && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse shadow-md shadow-red-500/5">
                            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                            {t('admin.alert_critical_title')}
                          </div>
                        )}
                      </div>

                      {/* Filter Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_status')}</label>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer"
                          >
                            <option value="All">{t('admin.filter_status_all')}</option>
                            <option value="new">{t('admin.status_new')}</option>
                            <option value="under_review">{t('admin.status_under_review')}</option>
                            <option value="resolved">{t('admin.status_resolved')}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_category')}</label>
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer"
                          >
                            <option value="All">{t('admin.filter_all')}</option>
                            <option value="Makanan">{t('categories.Makanan')}</option>
                            <option value="Kebersihan">{t('categories.Kebersihan')}</option>
                            <option value="Kemudahan">{t('categories.Kemudahan')}</option>
                            <option value="Perkhidmatan">{t('categories.Perkhidmatan')}</option>
                            <option value="Umum">{t('categories.Umum')}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_priority', 'Keutamaan')}</label>
                          <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer"
                          >
                            <option value="All">{t('admin.filter_priority_all')}</option>
                            <option value="high">{t('admin.priority_high')}</option>
                            <option value="medium">{t('admin.priority_medium')}</option>
                            <option value="low">{t('admin.priority_low')}</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('locations.filter_label')}</label>
                          <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer"
                          >
                            <option value="All">{t('locations.filter_all')}</option>
                            <option value="manual">{t('locations.fallback_manual')}</option>
                            {locations.map(loc => (
                              <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* List of Feedbacks */}
                      <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3">
                        {filteredFeedbacks.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">
                            {t('admin.no_data')}
                          </div>
                        ) : (
                          filteredFeedbacks.map((fb) => (
                            <div
                              key={fb.id}
                              onClick={() => setSelectedFeedback(fb)}
                              className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                selectedFeedback?.id === fb.id 
                                  ? 'bg-slate-900/80 border-sky-500/60 shadow-lg shadow-sky-500/5' 
                                  : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/50'
                              }`}
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  {getStatusBadge(fb.status)}
                                  {getPriorityBadge(fb.priority)}
                                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-300">
                                    {t(`categories.${fb.category}`, fb.category)}
                                  </span>
                                  {fb.location && (
                                    <span className="text-slate-500 text-xs flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      </svg>
                                      {fb.location}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-200 font-light truncate pr-6">
                                  {fb.description}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {formatTime(fb.submittedAt)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {fb.photoUrl && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800">
                                    <img src={fb.photoUrl} alt="Aduan" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <svg className="w-5 h-5 text-slate-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Side: Detail View Panel */}
                    <div className="w-full lg:w-[450px] glass-card rounded-2xl border border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between">
                      {selectedFeedback ? (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                              <h3 className="text-lg font-bold font-display text-white">
                                {t('admin.details_title')}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-500 select-all">
                                {t('admin.details_id')}: {selectedFeedback.id}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {getStatusBadge(selectedFeedback.status)}
                              {getPriorityBadge(selectedFeedback.priority)}
                            </div>

                            {selectedFeedback.photoUrl && (
                              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[160px] bg-slate-950/30">
                                <a href={selectedFeedback.photoUrl} target="_blank" rel="noopener noreferrer" className="relative group block">
                                  <img src={selectedFeedback.photoUrl} alt="Lampiran aduan" className="w-full h-36 object-cover group-hover:opacity-90 transition-opacity" />
                                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                                    {t('admin.open_full_photo', 'Buka fail penuh ↗')}
                                  </div>
                                </a>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/30 p-3 rounded-lg border border-slate-900">
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_sender', 'Pengirim')}</span>
                                <span className="text-slate-300 font-medium">
                                  {selectedFeedback.isAnonymous ? t('admin.details_anonymous_yes') : t('admin.details_anonymous_no')}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_date', 'Dihantar pada')}</span>
                                <span className="text-slate-300 font-medium">
                                  {formatTime(selectedFeedback.submittedAt)}
                                </span>
                              </div>
                              {selectedFeedback.location && (
                                <div className="col-span-2 border-t border-slate-900/50 pt-2 mt-1">
                                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('locations.filter_label')}</span>
                                  <span className="text-sky-400 font-medium flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {selectedFeedback.location}
                                    {selectedFeedback.locationId && <span className="text-[10px] text-slate-500 font-mono">({selectedFeedback.locationId})</span>}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">{t('form.description')}</span>
                              <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-sm font-light leading-relaxed text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                                {selectedFeedback.description}
                              </div>
                            </div>

                            <form onSubmit={handleUpdateFeedback} className="space-y-4 pt-3 border-t border-slate-900">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('admin.details_status')}</label>
                                  <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer"
                                  >
                                    <option value="new">{t('admin.status_new')}</option>
                                    <option value="under_review">{t('admin.status_under_review')}</option>
                                    <option value="resolved">{t('admin.status_resolved')}</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('admin.col_category')}</label>
                                  <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer"
                                  >
                                    <option value="Makanan">{t('categories.Makanan')}</option>
                                    <option value="Kebersihan">{t('categories.Kebersihan')}</option>
                                    <option value="Kemudahan">{t('categories.Kemudahan')}</option>
                                    <option value="Perkhidmatan">{t('categories.Perkhidmatan')}</option>
                                    <option value="Umum">{t('categories.Umum')}</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('admin.details_priority')}</label>
                                <select
                                  value={editPriority}
                                  onChange={(e) => setEditPriority(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer"
                                >
                                  <option value="high">{t('admin.priority_high')}</option>
                                  <option value="medium">{t('admin.priority_medium')}</option>
                                  <option value="low">{t('admin.priority_low')}</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('admin.details_notes')}</label>
                                <textarea
                                  value={editAdminNotes}
                                  onChange={(e) => setEditAdminNotes(e.target.value)}
                                  rows="3"
                                  placeholder={t('admin.details_notes_placeholder')}
                                  className="w-full px-3 py-2 rounded-lg glass-input text-xs placeholder-slate-600 focus:ring-sky-500"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={updatingFeedback}
                                className="w-full btn-primary py-2.5 text-xs font-semibold flex justify-center items-center"
                              >
                                {updatingFeedback ? t('common.saving') : t('admin.details_save')}
                              </button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-400">{t('admin.details_no_selection_title', 'Tiada Aduan Dipilih')}</h4>
                            <p className="text-xs text-slate-600 mt-1 max-w-[200px] mx-auto">
                              {t('admin.details_no_selection_desc', 'Klik mana-mana aduan daripada senarai untuk melihat perincian penuh.')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ANALYTICS VIEW */}
                {dashboardTab === 'analytics' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Bar Chart Category distribution */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_category_title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_category_subtitle', 'Analisis taburan bidang maklum balas yang diterima.')}</p>
                      </div>
                      <div className="h-64 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCategoryChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis allowDecimals={false} stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                            />
                            <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2: Pie Donut Chart Status distribution */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_status_title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_status_subtitle', 'Status kemajuan pengurusan aduan semasa.')}</p>
                      </div>
                      <div className="h-64 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
                        <div className="h-full w-full sm:w-2/3">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getStatusChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getStatusChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Custom Legend */}
                        <div className="flex flex-row sm:flex-col gap-4 text-xs font-medium text-slate-300">
                          {getStatusChartData().map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                              <span>{item.name}: {item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chart 3: Monthly Trend Line Chart */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4 lg:col-span-2">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_trend_title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_trend_subtitle', 'Melihat kestabilan aduan yang diterima sepanjang masa.')}</p>
                      </div>
                      <div className="h-64 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getTrendChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis allowDecimals={false} stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                            />
                            <Line type="monotone" dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2, r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 4: Location Feedback Count */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4 lg:col-span-2">
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{t('locations.chart_title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('locations.chart_subtitle')}</p>
                      </div>
                      <div className="h-64 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getLocationChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis allowDecimals={false} stroke="#64748b" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                            />
                            <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#818cf8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LOCATIONS MANAGEMENT */}
                {dashboardTab === 'locations' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form to register new location */}
                    <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-5 h-fit">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('locations.add_title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('locations.subtitle')}</p>
                      </div>

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleAddLocation} className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="newLocName" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('locations.name')}
                          </label>
                          <input
                            id="newLocName"
                            type="text"
                            required
                            value={newLocName}
                            onChange={handleLocNameChange}
                            placeholder={t('locations.name_placeholder')}
                            className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="newLocId" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('locations.id')}
                          </label>
                          <input
                            id="newLocId"
                            type="text"
                            required
                            value={newLocId}
                            onChange={(e) => setNewLocId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                            placeholder={t('locations.id_placeholder')}
                            className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={creatingLocation}
                          className="w-full btn-primary py-3 flex justify-center items-center gap-2"
                        >
                          {creatingLocation ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {t('locations.submitting_qr')}
                            </>
                          ) : t('locations.btn_add')}
                        </button>
                      </form>
                    </div>

                    {/* Right Column: Locations List Table */}
                    <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('locations.title')}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{t('locations.subtitle')}</p>
                      </div>

                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs font-light text-slate-700 dark:text-slate-300">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-wider text-[10px] text-slate-500">
                              <th className="py-3 px-4 font-semibold">{t('locations.col_name')}</th>
                              <th className="py-3 px-4 font-semibold">{t('locations.col_id')}</th>
                              <th className="py-3 px-4 font-semibold">{t('locations.col_qr')}</th>
                              <th className="py-3 px-4 font-semibold">{t('locations.col_status')}</th>
                              <th className="py-3 px-4 font-semibold text-right">{t('locations.col_actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {locations.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-10 text-slate-500">
                                  {t('admin.no_data')}
                                </td>
                              </tr>
                            ) : (
                              locations.map((loc) => (
                                <tr key={loc.id} className="border-b border-slate-100 dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                                  <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">{loc.name}</td>
                                  <td className="py-4 px-4 font-mono text-[10px] text-slate-500">{loc.id}</td>
                                  <td className="py-2 px-4">
                                    {loc.qrCodeUrl && (
                                      <a href={loc.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 bg-white p-1 rounded border border-slate-200 dark:border-slate-800 hover:scale-105 transition-transform">
                                        <img src={loc.qrCodeUrl} alt={loc.name} className="w-full h-full object-contain" />
                                      </a>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    {loc.active ? (
                                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        {t('locations.status_active')}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                        {t('locations.status_inactive')}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                                    <button
                                      onClick={() => handleToggleLocationStatus(loc)}
                                      className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                                        loc.active 
                                          ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' 
                                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                      }`}
                                    >
                                      {loc.active ? t('locations.deactivate') : t('locations.activate')}
                                    </button>
                                    <button
                                      onClick={() => handleDownloadQR(loc)}
                                      className="px-2.5 py-1 text-[10px] font-semibold rounded bg-sky-500 hover:bg-sky-400 text-white transition-colors"
                                    >
                                      {t('locations.download_qr')}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/30 text-center py-4 text-[10px] text-slate-600">
        &copy; {new Date().getFullYear()} Kafeteria TVET MARA Besut. Semua Hak Terpelihara.
      </footer>
    </div>
  )
}

export default App
