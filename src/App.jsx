// BUILD VERSION: 2026-06-11-v3
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Truck, Users, AlertCircle, RefreshCw, Edit2, Save, X, LogOut, ChevronDown, Wrench, Mail, Wifi, WifiOff } from 'lucide-react';

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes floatIn {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .flip-card {
    perspective: 1000px;
    cursor: pointer;
  }

.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 260px;
    transition: transform 0.6s ease;
    transform-style: preserve-3d;
  }

  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }

.flip-card-front,
  .flip-card-back {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
    padding: 30px;
  }

  .flip-card-back {
    transform: rotateY(180deg);
    overflow-y: auto;
  }

@media (max-width: 768px) {
    .flip-card {
      perspective: none;
    }

    .flip-card-inner {
      transform-style: flat;
      transition: none;
      min-height: unset !important;
      height: auto !important;
    }

    .flip-card-inner.flipped {
      transform: none;
    }

    .flip-card-front,
    .flip-card-back {
      position: relative;
      top: unset;
      left: unset;
      right: unset;
      backface-visibility: visible;
      -webkit-backface-visibility: visible;
      min-height: unset !important;
      height: auto !important;
      padding: 16px !important;
    }

    .flip-card-front {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px !important;
    }

    .flip-card-front span {
      font-size: 2rem !important;
    }

    .flip-card-front h3 {
      font-size: 1rem !important;
    }

    .flip-card-front p {
      font-size: 0.75rem !important;
    }

    .flip-card-back {
      transform: none;
      display: none;
    }

    .flip-card-back h3.flip-card-back-title {
      display: none !important;
    }

    .flip-card-inner.flipped .flip-card-front {
      display: none;
    }

    .flip-card-inner.flipped .flip-card-back {
      display: block;
    }
  }
`;
if (!document.getElementById('agritrack-animations')) {
  styleSheet.id = 'agritrack-animations';
  document.head.appendChild(styleSheet);
}

// Theme configurations
const themes = {
dark: {
    background: '#0a0a0a',
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    cardBackground: '#1e3a5f',
    cardBorder: '#2563eb',
    text: 'white',
    textSecondary: '#9ca3af',
    inputBackground: '#1a2942',
    modalBackground: '#1e3a5f',
    tabInactive: '#1e3a5f',
    gradient: 'linear-gradient(to right, #10b981, #06b6d4)',
    homeBackground: 'linear-gradient(135deg, rgba(30, 58, 95, 0.85) 0%, rgba(26, 41, 66, 0.85) 100%)',
  },
  light: {
    background: '#f3f4f6',
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.70), rgba(255, 248, 240, 0.80)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
    backgroundRepeat: 'no-repeat',
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    inputBackground: '#f9fafb',
    modalBackground: '#ffffff',
    tabInactive: '#dbeafe',
    gradient: 'linear-gradient(to right, #10b981, #06b6d4)',
    homeBackground: 'linear-gradient(135deg, rgba(219, 234, 254, 0.75) 0%, rgba(224, 242, 254, 0.80) 100%)',
  }
};

// Supabase configuration
const supabaseUrl = 'https://ekjjtfemibtaxyhuvgea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVramp0ZmVtaWJ0YXh5aHV2Z2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTM0ODgsImV4cCI6MjA4MzQyOTQ4OH0.c4qjGG0F1nCR0UcyttQKuMX4S_9bJlAPCglzq3fB8v0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

{/*Machinery categories for dropdown */}
const MACHINERY_CATEGORIES = [
  'Attachments',
  'Augers and Conveyors',
  'Bikes and Small Motors',
  'Bulldozer Blades',
  'Cars and Trucks',
  'Combines',
  'Dryers',
  'Grain Handling',
  'Harvest Equipment',
  'Heavy Trucks',
  'Land Improvement Equipment',
  'Landscape Equipment',
  'Lifts & Cranes',
  'Other',
  'Spreaders',
  'Spraying',
  'Straight Cut/Pick-Up Headers',
  'Tillage and Seeding',
  'Tractors',
  'Trailers',
];

const CATEGORY_TRACKING_TYPE = {
  'Attachments': 'hours',
  'Augers and Conveyors': 'hours',
  'Bikes and Small Motors': 'km',
  'Bulldozer Blades': 'hours',
  'Cars and Trucks': 'km',
  'Combines': 'hours',
  'Dryers': 'hours',
  'Grain Handling': 'hours',
  'Harvest Equipment': 'hours',
  'Heavy Trucks': 'km',
  'Land Improvement Equipment': 'hours',
  'Landscape Equipment': 'hours',
  'Lifts & Cranes': 'hours',
  'Other': 'none',
  'Spreaders': 'hours',
  'Spraying': 'hours',
  'Straight Cut/Pick-Up Headers': 'hours',
  'Tillage and Seeding': 'hours',
  'Tractors': 'hours',
  'Trailers': 'km',
};

const getTrackingType = (machine) => {
  if (machine.tracking_type) return machine.tracking_type;
  return CATEGORY_TRACKING_TYPE[machine.category] || 'hours';
};

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [activeSettingsSection, setActiveSettingsSection] = useState('general');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [imageModalTitle, setImageModalTitle] = useState('');
  const [viewingImageIndex, setViewingImageIndex] = useState(0);
  const [viewingImageArray, setViewingImageArray] = useState([]);
  const lastLocalUpdateRef = useRef(0);
  const isEditingRef = useRef(false);
  const recentlyUpdatedIdsRef = useRef(new Set());
  const [showRemindersPanel, setShowRemindersPanel] = useState(false);
  const [showCompleteReminderModal, setShowCompleteReminderModal] = useState(false);
  const [completingReminder, setCompletingReminder] = useState(null);
  const [showDeletedRemindersModal, setShowDeletedRemindersModal] = useState(false);
  const [deletedReminders, setDeletedReminders] = useState([]);
  const [restoringReminder, setRestoringReminder] = useState(null);
  const [restoreChoice, setRestoreChoice] = useState(null); // 'fresh' | 'original'
  const [showRestoreChoiceModal, setShowRestoreChoiceModal] = useState(false);
  const [pendingRestoreReminder, setPendingRestoreReminder] = useState(null);
  const [completeServiceForm, setCompleteServiceForm] = useState({
  logService: null,
  serviceType: '',
  date: '',
  notes: '',
  technician: '',
});
  const [flippedCards, setFlippedCards] = useState({});
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [kmExpanded, setKmExpanded] = useState(false);

const toggleCard = (cardId) => {
  setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
};
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [lastSync, setLastSync] = useState(false);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMachineryModal, setShowMachineryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showCategoryTabs, setShowCategoryTabs] = useState(false);

  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editingMachineryId, setEditingMachineryId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);

const [inventoryForm, setInventoryForm] = useState({ 
  name: '', partNumber: '', quantity: '', location: '', 
  minQuantity: '', maxQuantity: '', photoUrl: ''
});
const [machineryForm, setMachineryForm] = useState({ 
  name: '', vinSerial: '', category: '', status: 'Active', 
  photoUrl: '', requirements: '', tracking_type: '', licensePlate: ''
});
const [serviceForm, setServiceForm] = useState({
  machineName: '', 
  serviceType: '', 
  date: '', 
  notes: '', 
  technician: '',
  photoUrls: []
});
  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [savingMachinery, setSavingMachinery] = useState(false);
  const [inventorySaveConfirmed, setInventorySaveConfirmed] = useState(false);
  // Search and sort states
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventorySort, setInventorySort] = useState('name-asc');
  const [machinerySearch, setMachinerySearch] = useState('');
  const [machinerySort, setMachinerySort] = useState('name-asc');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceSort, setServiceSort] = useState('date-desc');
  const [serviceFilter, setServiceFilter] = useState('');
  const [machineSearchModal, setMachineSearchModal] = useState('');
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryItemsPerPage, setInventoryItemsPerPage] = useState(50);
  const [machineryPage, setMachineryPage] = useState(1);
  const [machineryItemsPerPage, setMachineryItemsPerPage] = useState(50);
  const [servicePage, setServicePage] = useState(1);
  const [serviceItemsPerPage, setServiceItemsPerPage] = useState(50);
  const [machineHours, setMachineHours] = useState([]);
  const [serviceReminders, setServiceReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [selectedMachineForReminder, setSelectedMachineForReminder] = useState('');
  const [reminderForm, setReminderForm] = useState({
  reminderName: '',
  hoursInterval: ''
});
const [hoursForm, setHoursForm] = useState({
  machineName: '',
  hoursToAdd: ''
});
const [selectedHoursRecord, setSelectedHoursRecord] = useState(null);
const [showHoursDetailModal, setShowHoursDetailModal] = useState(false);
const [editingHours, setEditingHours] = useState(false);
const [newTotalHours, setNewTotalHours] = useState('');;
const [machineKm, setMachineKm] = useState([]);
const [showKmModal, setShowKmModal] = useState(false);
const [showKmDetailModal, setShowKmDetailModal] = useState(false);
const [selectedKmRecord, setSelectedKmRecord] = useState(null);
const [editingKm, setEditingKm] = useState(false);
const [newTotalKm, setNewTotalKm] = useState('');
const [kmForm, setKmForm] = useState({ machineName: '', kmToAdd: '' });
const [showKmReminderModal, setShowKmReminderModal] = useState(false);
const [qrLibLoaded, setQrLibLoaded] = useState(false);

  // Export state
const [exportInventoryOpen, setExportInventoryOpen] = useState(false);
const [exportMachineryOpen, setExportMachineryOpen] = useState(false);
const [exportServiceOpen, setExportServiceOpen] = useState(false);
const [exportInventoryTab, setExportInventoryTab] = useState('all');
const [exportMachineryTab, setExportMachineryTab] = useState('all');
const [exportServiceTab, setExportServiceTab] = useState('all');
const [exportInventoryDateStart, setExportInventoryDateStart] = useState('');
const [exportInventoryDateEnd, setExportInventoryDateEnd] = useState('');
const [exportMachineryDateStart, setExportMachineryDateStart] = useState('');
const [exportMachineryDateEnd, setExportMachineryDateEnd] = useState('');
const [exportServiceDateStart, setExportServiceDateStart] = useState('');
const [exportServiceDateEnd, setExportServiceDateEnd] = useState('');
const [exportInventorySelected, setExportInventorySelected] = useState(new Set());
const [exportMachinerySelected, setExportMachinerySelected] = useState(new Set());
const [exportServiceSelected, setExportServiceSelected] = useState(new Set());
const [exportMode, setExportMode] = useState(null); // 'inventory' | 'machinery' | 'service' | null

  // Import state
const [importInventoryOpen, setImportInventoryOpen] = useState(false);
const [importMachineryOpen, setImportMachineryOpen] = useState(false);
const [importServiceOpen, setImportServiceOpen] = useState(false);
const [importInventoryTab, setImportInventoryTab] = useState('upload');
const [importMachineryTab, setImportMachineryTab] = useState('upload');
const [importServiceTab, setImportServiceTab] = useState('upload');
const [importInventoryPreview, setImportInventoryPreview] = useState(null);
const [importMachineryPreview, setImportMachineryPreview] = useState(null);
const [importServicePreview, setImportServicePreview] = useState(null);
const [showCategoryMapModal, setShowCategoryMapModal] = useState(false);
const [categoryMapData, setCategoryMapData] = useState(null);
const [categoryMappings, setCategoryMappings] = useState({});
const [importingInventory, setImportingInventory] = useState(false);
const [importingMachinery, setImportingMachinery] = useState(false);
const [importingService, setImportingService] = useState(false);
const [importInventoryResult, setImportInventoryResult] = useState(null);
const [importMachineryResult, setImportMachineryResult] = useState(null);
const [importServiceResult, setImportServiceResult] = useState(null);
const [calendarNotes, setCalendarNotes] = useState({});
const [calendarOpen, setCalendarOpen] = useState(false);
const [calendarSelectedKey, setCalendarSelectedKey] = useState(null);
const [calendarNoteText, setCalendarNoteText] = useState('');
const [calendarNoteDirty, setCalendarNoteDirty] = useState(false);
const [calendarSaving, setCalendarSaving] = useState(false);
const [calendarSaved, setCalendarSaved] = useState(false);
const [technicians, setTechnicians] = useState([]);
const [newTechnicianName, setNewTechnicianName] = useState('');
const [editingTechnicianId, setEditingTechnicianId] = useState(null);
const [editingTechnicianName, setEditingTechnicianName] = useState('');
const [showTechnicianList, setShowTechnicianList] = useState(false);
const [expandedCard, setExpandedCard] = useState(null);
const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  
  // Get current theme object
  const currentTheme = themes[theme];

useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></svg>";
    document.head.appendChild(link);
   setQrLibLoaded(true);
  }, []);
  // Check authentication status on load
  useEffect(() => {
    checkUser();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
      setupRealtime();
    }
  }, [user]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
// Load theme preference on mount (runs once when app loads)
  useEffect(() => {
    const savedTheme = localStorage.getItem('agritrack-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, []);

useEffect(() => {
  const handleResize = () => setIsDesktop(window.innerWidth >= 768);
  window.addEventListener('resize', handleResize);
  handleResize();
  return () => window.removeEventListener('resize', handleResize);
}, []);
  
  // Handle QR code deep link — navigate to inventory item once data is loaded
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#inventory/')) return;
    const itemId = hash.replace('#inventory/', '');
    if (!itemId) return;
    if (loading) return;
    if (inventory.length === 0) return;

    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    // Switch to inventory tab and set pagination to show all so item is visible
    setActiveTab('inventory');
    setInventoryItemsPerPage(99999);
    setInventoryPage(1);

    const tryScroll = (attemptsLeft) => {
      const el = document.getElementById(`inventory-item-${itemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'outline 0.3s ease';
        el.style.outline = '3px solid #10b981';
        el.style.borderRadius = '12px';
        setTimeout(() => { el.style.outline = ''; }, 20000);
      } else if (attemptsLeft > 0) {
        setTimeout(() => tryScroll(attemptsLeft - 1), 400);
      }
    };

    setTimeout(() => tryScroll(15), 300);
  }, [loading, inventory]);
  // Save theme preference whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('agritrack-theme', theme);
    }
  }, [theme, user]);

const checkUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Session user:', session?.user?.id);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      // Fetch user role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('👤 Role query result:', roleData);
      console.log('❌ Role query error:', error);
      
      if (!error && roleData) {
        console.log('✅ Setting role to:', roleData.role);
        setUserRole(roleData.role);
      } else {
        console.log('⚠️ No role found, defaulting to employee');
        setUserRole('employee'); // Default role
      }
      
    } else {
      
      setLoading(false);
    }
  } catch (error) {
    console.error('Error checking user:', error);
    setLoading(false);
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      setUser(data.user);
      console.log('🔐 Logged in user ID:', data.user.id);
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      console.log('👤 Role data after login:', roleData);
      console.log('❌ Role error after login:', roleError);
      
      if (!roleError && roleData) {
        console.log('✅ Setting user role to:', roleData.role);
        setUserRole(roleData.role);
      } else {
        console.log('⚠️ Defaulting to employee role');
        setUserRole('employee');
      }
      
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid email or password');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setInventory([]);
      setMachinery([]);
      setServiceHistory([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleSettingsClick = () => {
    if (activeTab === 'settings') {
      setShowSettingsDropdown(!showSettingsDropdown);
    } else {
      setActiveTab('settings');
      setShowSettingsDropdown(true);
    }
  };

  const handleSettingsSectionClick = (section) => {
    setActiveSettingsSection(section);
    setShowSettingsDropdown(false);
    setActiveTab('settings');
  };
  const handlePasswordRecovery = async () => {
  if (!recoveryEmail.trim()) {
    setRecoveryError('Please enter your email address');
    return;
  }

  setSendingRecovery(true);
  setRecoveryError('');
  setRecoveryMessage('');

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: window.location.origin,
    });

    if (error) throw error;

    setRecoveryMessage('Password recovery email sent! Please check your inbox.');
    setRecoveryEmail('');
    
    setTimeout(() => {
      setShowPasswordRecovery(false);
      setRecoveryMessage('');
    }, 3000);
    
  } catch (error) {
    console.error('Password recovery error:', error);
    setRecoveryError(error.message || 'Failed to send recovery email. Please try again.');
  } finally {
    setSendingRecovery(false);
  }
};
  
const loadData = async () => {
  try {
    console.log('📥 Loading data...');
    setLoading(true);
    
    let allInventory = [];
    let inventoryPage = 0;
    let hasMoreInventory = true;
    const pageSize = 1000;
    
    while (hasMoreInventory) {
      const { data: inventoryData, error: invError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })
        .range(inventoryPage * pageSize, (inventoryPage + 1) * pageSize - 1);
      
      if (invError) {
        console.error('❌ Inventory load error:', invError);
        throw invError;
      }
      
if (inventoryData && inventoryData.length > 0) {
        allInventory = [...allInventory, ...inventoryData];
        inventoryPage++;
        // Only stop if we got a full page — a short page on a slow connection
        // could be a partial result, so retry once before giving up
        if (inventoryData.length < pageSize) {
          // Verify by attempting the next page — if it returns 0 we're truly done
          const { data: checkData } = await supabase
            .from('inventory_items')
            .select('id')
            .range(inventoryPage * pageSize, inventoryPage * pageSize)
            .limit(1);
          hasMoreInventory = !!(checkData && checkData.length > 0);
        }
      } else {
        hasMoreInventory = false;
      }
    }
    
    console.log(`✅ Loaded ${allInventory.length} inventory items from database`);
    setInventory(allInventory.map(item => ({
      id: item.id,
      name: item.name || '',
      partNumber: item.part_number || '',
      quantity: item.quantity || '',
      location: item.location || '',
      minQuantity: item.min_quantity || '',
      maxQuantity: item.max_quantity || '',
      photoUrl: item.photo_url || ''
    })));
    
    let allMachinery = [];
    let machineryPage = 0;
    let hasMoreMachinery = true;
    
    while (hasMoreMachinery) {
      const { data: machineryData, error: machError } = await supabase
        .from('machinery_items')
        .select('*')
        .order('name', { ascending: true })
        .range(machineryPage * pageSize, (machineryPage + 1) * pageSize - 1);
      
      if (machError) {
        console.error('❌ Machinery load error:', machError);
        throw machError;
      }
      
      if (machineryData && machineryData.length > 0) {
        allMachinery = [...allMachinery, ...machineryData];
        machineryPage++;
        hasMoreMachinery = machineryData.length === pageSize;
      } else {
        hasMoreMachinery = false;
      }
    }
    
    console.log(`✅ Loaded ${allMachinery.length} machinery items from database`);
setMachinery(allMachinery.map(item => ({
  id: item.id,
  name: item.name || '',
  vinSerial: item.vin_serial || '',
  category: item.category || '',
  status: item.status || 'Active',
  photoUrl: item.photo_url || '',
  requirements: item.requirements || '',
  tracking_type: item.tracking_type || '',
  licensePlate: item.license_plate || ''
})));
    
    let allServiceRecords = [];
    let servicePage = 0;
    let hasMoreService = true;
    
    while (hasMoreService) {
      const { data: serviceData, error: servError } = await supabase
        .from('service_records')
        .select('*')
        .order('date', { ascending: false })
        .range(servicePage * pageSize, (servicePage + 1) * pageSize - 1);
      
      if (servError) {
        console.error('❌ Service records load error:', servError);
        throw servError;
      }
      
      if (serviceData && serviceData.length > 0) {
        allServiceRecords = [...allServiceRecords, ...serviceData];
        servicePage++;
        hasMoreService = serviceData.length === pageSize;
      } else {
        hasMoreService = false;
      }
    }
    
    console.log(`✅ Loaded ${allServiceRecords.length} service records from database`);
    
    const mappedServiceRecords = [];
    let skippedRecords = 0;
    
    for (const item of allServiceRecords) {
      try {
        let photoUrls = [];
        
if (item.photo_urls) {
  try {
    photoUrls = JSON.parse(item.photo_urls);
  } catch (parseError) {
    if (typeof item.photo_urls === 'string' && item.photo_urls.trim().length > 0) {
      photoUrls = [item.photo_urls];
    } else {
      console.warn(`⚠️ Could not parse photo_urls for record ${item.id}:`, parseError);
      photoUrls = [];
    }
  }
} else if (item.photo_url) {
  photoUrls = [item.photo_url];
}
        
        mappedServiceRecords.push({
          id: item.id,
          machineName: item.machine_name || '',
          serviceType: item.service_type || '',
          date: item.date || '',
          notes: item.notes || '',
          technician: item.technician || '',
          photoUrls: photoUrls
        });
      } catch (recordError) {
        console.error(`❌ Error mapping service record ${item.id}:`, recordError);
        skippedRecords++;
      }
    }
    
    if (skippedRecords > 0) {
      console.warn(`⚠️ Skipped ${skippedRecords} problematic service records`);
      alert(`Warning: ${skippedRecords} service record(s) could not be loaded due to data format issues. Please check console for details.`);
    }
    
    setServiceHistory(mappedServiceRecords);
console.log(`✅ Successfully mapped ${mappedServiceRecords.length} service records`);

// Load machine hours
const { data: hoursData, error: hoursError } = await supabase
  .from('machine_hours')
  .select('*')
  .order('machine_name', { ascending: true });

if (hoursError) {
  console.error('❌ Machine hours load error:', hoursError);
} else {
  console.log(`✅ Loaded ${hoursData?.length || 0} machine hour records`);
  setMachineHours(hoursData || []);
}

// Load service reminders
const { data: remindersData, error: remindersError } = await supabase
  .from('service_reminders')
  .select('*')
  .order('machine_name', { ascending: true });

if (remindersError) {
  console.error('❌ Service reminders load error:', remindersError);
} else {
  console.log(`✅ Loaded ${remindersData?.length || 0} service reminders`);
  setServiceReminders(remindersData || []);
}

    const { data: kmData, error: kmError } = await supabase
  .from('machine_km')
  .select('*')
  .order('machine_name', { ascending: true });
if (kmError) console.error('❌ Machine km load error:', kmError);
else {
  console.log(`✅ Loaded ${kmData?.length || 0} machine km records`);
  setMachineKm(kmData || []);
}
const { data: techData, error: techError } = await supabase
  .from('technicians')
  .select('*')
  .order('name', { ascending: true });

if (techError) {
  console.error('❌ Technicians load error:', techError);
} else {
  console.log(`✅ Loaded ${techData?.length || 0} technicians`);
  setTechnicians((techData || []).sort((a, b) => {
    const lastA = a.name.trim().split(' ').pop().toLowerCase();
    const lastB = b.name.trim().split(' ').pop().toLowerCase();
    return lastA.localeCompare(lastB);
  }));
}
const ADMIN_USER_ID = '001f830b-05d1-4f2d-ba0c-846a6acd3fae';
const { data: calNotesData, error: calNotesError } = await supabase
  .from('calendar_notes')
  .select('*')
  .eq('user_id', ADMIN_USER_ID);

if (calNotesError) {
  console.error('❌ Calendar notes load error:', calNotesError);
} else {
  const notesMap = {};
  (calNotesData || []).forEach(n => {
    notesMap[`${n.month_index}-${n.week_number}`] = n.note;
  });
  setCalendarNotes(notesMap);
  console.log(`✅ Loaded ${calNotesData?.length || 0} calendar notes`);
}
setLastSync(new Date());
  } catch (error) {
    console.error('❌ CRITICAL Load error:', error); 
    console.error('Error details:', JSON.stringify(error, null, 2));
    alert('Failed to load data: ' + error.message + '\n\nCheck browser console (F12) for details.');
  } finally {
    setLoading(false);
  }
};

const setupRealtime = () => {
  console.log('🔔 Setting up real-time...');

// Watch inventory_items table
supabase
  .channel('inventory-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, (payload) => {
    console.log('🔔 Inventory change');
    if (payload.eventType === 'INSERT') {
      setInventory(prev => [...prev, {
        id: payload.new.id,
        name: payload.new.name,
        partNumber: payload.new.part_number,
        quantity: payload.new.quantity,
        location: payload.new.location,
        minQuantity: payload.new.min_quantity,
        maxQuantity: payload.new.max_quantity,
        photoUrl: payload.new.photo_url
      }]);
    } else if (payload.eventType === 'UPDATE') {
  // ✅ Skip realtime update if we just updated this item locally
  if (recentlyUpdatedIdsRef.current.has(payload.new.id)) return;
  setInventory(prev => prev.map(item => item.id === payload.new.id ? {
    id: payload.new.id,
    name: payload.new.name,
    partNumber: payload.new.part_number,
    quantity: payload.new.quantity,
    location: payload.new.location,
    minQuantity: payload.new.min_quantity,
    maxQuantity: payload.new.max_quantity,
    photoUrl: payload.new.photo_url
  } : item));
} else if (payload.eventType === 'DELETE') {
      setInventory(prev => prev.filter(item => item.id !== payload.old.id));
    }
    setLastSync(new Date());
  })
  .subscribe();

  // Watch machinery_items table
  supabase
    .channel('machinery-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'machinery_items' }, (payload) => {
      console.log('🔔 Machinery change');
if (payload.eventType === 'INSERT') {
setMachinery(prev => [...prev, {
  id: payload.new.id,
  name: payload.new.name,
  vinSerial: payload.new.vin_serial,
  category: payload.new.category,
  status: payload.new.status,
  photoUrl: payload.new.photo_url,
  requirements: payload.new.requirements || '',
  tracking_type: payload.new.tracking_type || '',
  licensePlate: payload.new.license_plate || ''
}]);
} else if (payload.eventType === 'UPDATE') {
setMachinery(prev => prev.map(item => item.id === payload.new.id ? {
  id: payload.new.id,
  name: payload.new.name,
  vinSerial: payload.new.vin_serial,
  category: payload.new.category,
  status: payload.new.status,
  photoUrl: payload.new.photo_url,
  requirements: payload.new.requirements || '',
  tracking_type: payload.new.tracking_type || '',
  licensePlate: payload.new.license_plate || ''
} : item));
      } else if (payload.eventType === 'DELETE') {
        setMachinery(prev => prev.filter(item => item.id !== payload.old.id));
      }
      setLastSync(new Date());
    })
    .subscribe();

  // Watch service_records table
  supabase
  .channel('service-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'service_records' }, (payload) => {
    console.log('🔔 Service change');
    if (payload.eventType === 'INSERT') {
      setServiceHistory(prev => [...prev, {
        id: payload.new.id,
        machineName: payload.new.machine_name,
        serviceType: payload.new.service_type,
        date: payload.new.date,
        notes: payload.new.notes,
        technician: payload.new.technician,
        photoUrls: payload.new.photo_urls
        ? JSON.parse(payload.new.photo_urls)
        : (payload.new.photo_url ? [payload.new.photo_url] : [])
  }]);
}
 else if (payload.eventType === 'UPDATE') {
      setServiceHistory(prev => prev.map(item => item.id === payload.new.id ? {
        id: payload.new.id,
        machineName: payload.new.machine_name,
        serviceType: payload.new.service_type,
        date: payload.new.date,
        notes: payload.new.notes,
        technician: payload.new.technician,
        photoUrls: payload.new.photo_urls
        ? JSON.parse(payload.new.photo_urls)
        : (payload.new.photo_url ? [payload.new.photo_url] : [])

  } : item));
} else if (payload.eventType === 'DELETE') {
      setServiceHistory(prev => prev.filter(item => item.id !== payload.old.id));
    }
    setLastSync(new Date());
  })
.subscribe();

// Watch machine_hours table
supabase
  .channel('hours-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'machine_hours' }, (payload) => {
    console.log('🔔 Machine hours change');
    if (payload.eventType === 'INSERT') {
      setMachineHours(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setMachineHours(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
    } else if (payload.eventType === 'DELETE') {
      setMachineHours(prev => prev.filter(item => item.id !== payload.old.id));
    }
    setLastSync(new Date());
  })
  .subscribe();

// Watch service_reminders table
supabase
  .channel('reminders-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'service_reminders' }, (payload) => {
    console.log('🔔 Service reminders change');
    if (payload.eventType === 'INSERT') {
      setServiceReminders(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setServiceReminders(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
    } else if (payload.eventType === 'DELETE') {
      setServiceReminders(prev => prev.filter(item => item.id !== payload.old.id));
    }
    setLastSync(new Date());
  })
  .subscribe();

supabase
  .channel('km-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'machine_km' }, (payload) => {
    if (payload.eventType === 'INSERT') setMachineKm(prev => [...prev, payload.new]);
    else if (payload.eventType === 'UPDATE') setMachineKm(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
    else if (payload.eventType === 'DELETE') setMachineKm(prev => prev.filter(item => item.id !== payload.old.id));
    setLastSync(new Date());
  })
  .subscribe();
  
setRealtimeStatus('connected');
};

const handlePhotoUpload = async (file, formType) => {
  if (!file) return null;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (JPG, PNG, etc.)');
    return null;
  }

  setUploadingPhoto(true);

  try {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
// Fixed quality settings
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const quality = 0.85;
    
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    let base64Result = canvas.toDataURL('image/jpeg', quality);

    if (base64Result.length > 4 * 1024 * 1024) {
      canvas.width = width * 0.6;
      canvas.height = height * 0.6;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      base64Result = canvas.toDataURL('image/jpeg', 0.5);
      
      if (base64Result.length > 4 * 1024 * 1024) {
        alert('Image is too large. Please try a smaller image.');
        setUploadingPhoto(false);
        URL.revokeObjectURL(objectUrl);
        return null;
      }
    }

    URL.revokeObjectURL(objectUrl);
    setUploadingPhoto(false);

    const finalSizeMB = (base64Result.length / (1024 * 1024)).toFixed(2);
    console.log(`✅ Image compressed to ${finalSizeMB}MB`);

    return base64Result;

  } catch (error) {
    console.error('Image processing error:', error);
    alert('Failed to process image. Please try a different image.');
    setUploadingPhoto(false);
    return null;
  }
};

// ── IMPORT HELPERS ──

const downloadTemplate = (type) => {
  const templates = {
    inventory: {
      headers: ['Name', 'Part Number', 'Quantity', 'Location', 'Min Qty', 'Max Qty'],
      example: ['Example Item', 'PN-001', '10', 'Shelf A', '2', '20'],
      filename: 'inventory-template.csv'
    },
    machinery: {
      headers: ['Name', 'VIN/Serial', 'Category', 'Status', 'License Plate'],
      example: ['Example Tractor', 'VIN123456', 'Tractors', 'Active', 'ABC-123'],
      filename: 'machinery-template.csv'
    },
    service: {
      headers: ['Machine', 'Service Type', 'Date', 'Technician', 'Notes'],
      example: ['Example Tractor', 'Oil Change', '2025-01-15', 'John Smith', 'Changed oil and filter'],
      filename: 'service-template.csv'
    }
  };

  const t = templates[type];
  const csv = [t.headers.join(','), t.example.map(v => `"${v}"`).join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = t.filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const parseImportCSV = (text, type) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return { rows: [], duplicates: [], invalidCategories: [], errors: ['File appears to be empty or has no data rows.'] };

  const dataLines = lines.slice(1);
  const rows = [];
  const duplicates = [];
  const invalidCategories = [];
  const errors = [];

  dataLines.forEach((line, index) => {
    // Handle quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += line[i];
      }
    }
    fields.push(current.trim());

    if (type === 'inventory') {
      const [name, partNumber, quantity, location, minQty, maxQty] = fields;
      if (!name) { errors.push(`Row ${index + 2}: Missing name — skipped`); return; }

      const isDuplicate = inventory.some(
        i => i.name?.toLowerCase() === name?.toLowerCase()
      );
      if (isDuplicate) duplicates.push({ rowIndex: index + 2, name });

      rows.push({ name, partNumber: partNumber || '', quantity: quantity || '0', location: location || '', minQty: minQty || '', maxQty: maxQty || '', isDuplicate });
    }

    if (type === 'machinery') {
      const [name, vinSerial, category, status, licensePlate] = fields;
      if (!name) { errors.push(`Row ${index + 2}: Missing name — skipped`); return; }

      const isDuplicate = machinery.some(
        m => m.name?.toLowerCase() === name?.toLowerCase()
      );
      if (isDuplicate) duplicates.push({ rowIndex: index + 2, name });

      const isValidCategory = MACHINERY_CATEGORIES.includes(category);
      if (!isValidCategory && category) invalidCategories.push(category);

      rows.push({ name, vinSerial: vinSerial || '', category: category || '', status: status || 'Active', licensePlate: licensePlate || '', isDuplicate, isValidCategory: isValidCategory || !category });
    }

    if (type === 'service') {
      const [machineName, serviceType, date, technician, notes] = fields;
      if (!machineName) { errors.push(`Row ${index + 2}: Missing machine name — skipped`); return; }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (date && !dateRegex.test(date)) {
        errors.push(`Row ${index + 2}: Invalid date format "${date}" — expected YYYY-MM-DD`);
        return;
      }

      const isDuplicate = serviceHistory.some(
        r => r.machineName?.toLowerCase() === machineName?.toLowerCase() &&
             r.serviceType?.toLowerCase() === serviceType?.toLowerCase() &&
             r.date === date
      );
      if (isDuplicate) duplicates.push({ rowIndex: index + 2, name: `${machineName} / ${serviceType} / ${date}` });

      rows.push({ machineName, serviceType: serviceType || '', date: date || '', technician: technician || '', notes: notes || '', isDuplicate });
    }
  });

  const uniqueInvalidCategories = [...new Set(invalidCategories)];
  return { rows, duplicates, invalidCategories: uniqueInvalidCategories, errors };
};

const runImport = async (type, rows, catMap = {}) => {
  const succeeded = [];
  const failed = [];

  if (type === 'inventory') {
    setImportingInventory(true);
    for (const row of rows) {
      try {
        const newId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
        const newItem = {
          id: newId,
          user_id: user.id,
          name: row.name,
          part_number: row.partNumber,
          quantity: row.quantity,
          location: row.location,
          min_quantity: row.minQty,
          max_quantity: row.maxQty,
          photo_url: ''
        };
        const { error } = await supabase.from('inventory_items').insert([newItem]);
        if (error) throw error;
        setInventory(prev => [...prev, {
          id: newId,
          name: newItem.name,
          partNumber: newItem.part_number,
          quantity: newItem.quantity,
          location: newItem.location,
          minQuantity: newItem.min_quantity,
          maxQuantity: newItem.max_quantity,
          photoUrl: ''
        }]);
        succeeded.push(row.name);
      } catch (err) {
        failed.push({ name: row.name, reason: err.message });
      }
    }
    setImportingInventory(false);
    setImportInventoryResult({ succeeded, failed });
  }

  if (type === 'machinery') {
    setImportingMachinery(true);
    for (const row of rows) {
      try {
        const resolvedCategory = catMap[row.category] ?? row.category;
        const newId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
        const newItem = {
          id: newId,
          user_id: user.id,
          name: row.name,
          vin_serial: row.vinSerial,
          category: resolvedCategory,
          status: row.status || 'Active',
          photo_url: '',
          requirements: '',
          tracking_type: null,
          license_plate: row.licensePlate || ''
        };
        const { error } = await supabase.from('machinery_items').insert([newItem]);
        if (error) throw error;
        setMachinery(prev => [...prev, {
          id: newId,
          name: newItem.name,
          vinSerial: newItem.vin_serial,
          category: newItem.category,
          status: newItem.status,
          photoUrl: '',
          requirements: '',
          tracking_type: '',
          licensePlate: newItem.license_plate
        }]);
        succeeded.push(row.name);
      } catch (err) {
        failed.push({ name: row.name, reason: err.message });
      }
    }
    setImportingMachinery(false);
    setImportMachineryResult({ succeeded, failed });
  }

  if (type === 'service') {
    setImportingService(true);
    for (const row of rows) {
      try {
        const newId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
        const newItem = {
          id: newId,
          user_id: user.id,
          machine_name: row.machineName,
          service_type: row.serviceType,
          date: row.date,
          technician: row.technician,
          notes: row.notes,
          photo_urls: JSON.stringify([])
        };
        const { error } = await supabase.from('service_records').insert([newItem]);
        if (error) throw error;
        setServiceHistory(prev => [{
          id: newId,
          machineName: newItem.machine_name,
          serviceType: newItem.service_type,
          date: newItem.date,
          technician: newItem.technician,
          notes: newItem.notes,
          photoUrls: []
        }, ...prev]);
        succeeded.push(row.machineName);
      } catch (err) {
        failed.push({ name: row.machineName, reason: err.message });
      }
    }
    setImportingService(false);
    setImportServiceResult({ succeeded, failed });
  }
};
  
const exportToCSV = (rows, headers, filename) => {
  const escape = (val) => {
    const str = (val === null || val === undefined) ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escape).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const isTimestampId = (id) => /^\d{13}$/.test(String(id));

const idToDate = (id) => {
  if (!isTimestampId(id)) return null;
  return new Date(Number(id));
};

const getInventoryRows = (items) => items.map(item => [
  item.name, item.partNumber, item.quantity,
  item.location, item.minQuantity, item.maxQuantity
]);

const getMachineryRows = (items) => items.map(item => [
  item.name, item.vinSerial, item.category, item.status, item.licensePlate
]);

const getServiceRows = (items) => items.map(item => [
  item.machineName, item.serviceType, item.date, item.technician, item.notes
]);
  
  const getStockStatus = (item) => {
    const qty = parseInt(item.quantity) || 0;
    const min = parseInt(item.minQuantity) || 0;
    const max = parseInt(item.maxQuantity) || Infinity;

    if (min > 0 && qty <= min) return 'low';
    if (max < Infinity && qty >= max) return 'high';
    return 'normal';
  };

  const getFilteredAndSortedInventory = () => {
  let filtered = inventory.filter(item => {
    const searchLower = inventorySearch.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.partNumber?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  });

  return filtered.sort((a, b) => {
    switch (inventorySort) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'quantity-asc':
        return (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0);
      case 'quantity-desc':
        return (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0);
      case 'recently-added':
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idB - idA;
      case 'location':
        return (a.location || '').localeCompare(b.location || '');
      default:
        return 0;
    }
  });
};

const getPaginatedInventory = () => {
  const filtered = getFilteredAndSortedInventory();
  const startIndex = (inventoryPage - 1) * inventoryItemsPerPage;
  const endIndex = startIndex + inventoryItemsPerPage;
  return {
    items: filtered.slice(startIndex, endIndex),
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / inventoryItemsPerPage),
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, filtered.length)
  };
};
 const getPaginatedMachinery = () => {
  const filtered = getFilteredAndSortedMachinery();
  const startIndex = (machineryPage - 1) * machineryItemsPerPage;
  const endIndex = startIndex + machineryItemsPerPage;
  return {
    items: filtered.slice(startIndex, endIndex),
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / machineryItemsPerPage),
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, filtered.length)
  };
}; 
  const getPaginatedService = () => {
  const filtered = getFilteredAndSortedService();
  const startIndex = (servicePage - 1) * serviceItemsPerPage;
  const endIndex = startIndex + serviceItemsPerPage;
  return {
    items: filtered.slice(startIndex, endIndex),
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / serviceItemsPerPage),
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, filtered.length)
  };
};
  const getFilteredAndSortedMachinery = () => {
    let filtered = machinery.filter(item => {
      const searchLower = machinerySearch.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.vinSerial?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      switch (machinerySort) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
  };

const getFilteredAndSortedService = () => {
  let filtered = serviceHistory.filter(record => {
    if (serviceFilter && record.machineName !== serviceFilter) {
      return false;
    }
    
    const searchLower = serviceSearch.toLowerCase();
    return (
      record.machineName?.toLowerCase().includes(searchLower) ||
      record.serviceType?.toLowerCase().includes(searchLower) ||
      record.technician?.toLowerCase().includes(searchLower) ||
      record.notes?.toLowerCase().includes(searchLower)
    );
  });

    return filtered.sort((a, b) => {
      switch (serviceSort) {
        case 'date-desc':
          return (b.date || '').localeCompare(a.date || '');
        case 'date-asc':
          return (a.date || '').localeCompare(b.date || '');
        case 'recently-added':
          return Number(b.id) - Number(a.id);
        default:
          return 0;
      }
    });
  };

  const saveData = async () => {
    setSyncing(true);
    try {
      console.log('💾 Saving data...');
      const { error } = await supabase
        .from('agritrack_data')
        .update({
          inventory,
          machinery,
          service_history: serviceHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      console.log('✅ Data saved');
      setLastSync(new Date());
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

const addInventoryItem = async () => {
  if (uploadingPhoto || savingInventory) return;
  setSavingInventory(true);
  
  try {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      user_id: user.id,
      name: inventoryForm.name,
      part_number: inventoryForm.partNumber,
      quantity: inventoryForm.quantity,
      location: inventoryForm.location,
      min_quantity: inventoryForm.minQuantity,
      max_quantity: inventoryForm.maxQuantity,
      photo_url: inventoryForm.photoUrl || ''
    };

    // Attempt insert with one retry on failure
    let result = await supabase.from('inventory_items').insert([newItem]);
    if (result.error) {
      console.warn('First insert attempt failed, retrying...', result.error);
      await new Promise(r => setTimeout(r, 800));
      result = await supabase.from('inventory_items').insert([newItem]);
    }
    if (result.error) throw result.error;

    // Verify the item actually exists in the database
    const { data: verified, error: verifyError } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('id', newId)
      .single();

    if (verifyError || !verified) {
      throw new Error('Item did not save correctly — please try again.');
    }

    // ✅ Only update local state after confirmed save
    setInventory(prev => [...prev, {
      id: newId,
      name: newItem.name,
      partNumber: newItem.part_number,
      quantity: newItem.quantity,
      location: newItem.location,
      minQuantity: newItem.min_quantity,
      maxQuantity: newItem.max_quantity,
      photoUrl: newItem.photo_url
    }]);

    console.log('✅ Inventory saved and verified!');
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
    setShowInventoryModal(false);

    // Show confirmation banner briefly
    setInventorySaveConfirmed(true);
    setTimeout(() => setInventorySaveConfirmed(false), 4000);

} catch (error) {
    console.error('Add error:', error);
    alert('❌ Failed to save item: ' + error.message + '\n\nPlease try again. If this keeps happening, check your internet connection.');
  } finally {
    setSavingInventory(false);
  }
};
 const deleteInventoryItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setInventory(prev => prev.filter(item => item.id !== id));
    
    await supabase.from('inventory_items').delete().eq('id', id);
    console.log('✅ Item deleted');
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};

const startEditInventory = (item) => {
  isEditingRef.current = true;
  setEditingInventoryId(item.id);
  setInventoryForm({
    name: item.name || '',
    partNumber: item.partNumber || '',
    quantity: item.quantity || '',
    location: item.location || '',
    minQuantity: item.minQuantity || '',
    maxQuantity: item.maxQuantity || '',
    photoUrl: item.photoUrl || ''
  });
};

const saveInventoryEdit = async (id) => {
  setSavingInventory(true);
  try {
    const updates = {
      name: inventoryForm.name,
      part_number: inventoryForm.partNumber,
      quantity: inventoryForm.quantity,
      location: inventoryForm.location,
      min_quantity: inventoryForm.minQuantity,
      max_quantity: inventoryForm.maxQuantity,
      photo_url: inventoryForm.photoUrl || ''
    };
    
   recentlyUpdatedIdsRef.current.add(id);

setTimeout(() => {
  recentlyUpdatedIdsRef.current.delete(id);
}, 15000);

let result = await supabase.from('inventory_items').update(updates).eq('id', id);
    if (result.error) {
      console.warn('First update attempt failed, retrying...', result.error);
      await new Promise(r => setTimeout(r, 800));
      result = await supabase.from('inventory_items').update(updates).eq('id', id);
    }
    if (result.error) throw result.error;

    // Verify the update actually landed in the database
    const { data: verified, error: verifyError } = await supabase
      .from('inventory_items')
      .select('id, quantity')
      .eq('id', id)
      .single();

    if (verifyError || !verified) {
      throw new Error('Edit did not save correctly — please try again.');
    }

    setInventory(prev => prev.map(item => 
      item.id === id ? {
        id: item.id,
        name: updates.name,
        partNumber: updates.part_number,
        quantity: updates.quantity,
        location: updates.location,
        minQuantity: updates.min_quantity,
        maxQuantity: updates.max_quantity,
        photoUrl: updates.photo_url
      } : item
    ));

    console.log('✅ Inventory updated and verified!');
    setEditingInventoryId(null);
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });

    // Show confirmation banner briefly
    setInventorySaveConfirmed(true);
    setTimeout(() => setInventorySaveConfirmed(false), 4000);

} catch (error) {
    console.error('Update error:', error);
    alert('❌ Failed to save edit: ' + error.message + '\n\nPlease try again. If this keeps happening, check your internet connection.');
  } finally {
    setSavingInventory(false);
  }
};
    
const cancelInventoryEdit = () => {
  setEditingInventoryId(null);
  isEditingRef.current = false;
  setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
};

const addMachineryItem = async () => {
  if (uploadingPhoto) return;
  
  try {
const newItem = {
  id: Date.now().toString(),
  user_id: user.id,
  name: machineryForm.name,
  vin_serial: machineryForm.vinSerial,
  category: machineryForm.category,
  status: machineryForm.status || 'Active',
  photo_url: machineryForm.photoUrl || '',
  tracking_type: machineryForm.tracking_type || null,
  license_plate: machineryForm.licensePlate || ''
};
    
    await supabase.from('machinery_items').insert([newItem]);
    
    // ✅ IMMEDIATELY update local state
setMachinery(prev => [...prev, {
  id: newItem.id,
  name: newItem.name,
  vinSerial: newItem.vin_serial,
  category: newItem.category,
  status: newItem.status,
  photoUrl: newItem.photo_url,
  requirements: newItem.requirements || '',
  tracking_type: newItem.tracking_type || '',
  licensePlate: newItem.license_plate || ''
}]);
    
    console.log('✅ Machinery saved - FAST!');
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
    setShowMachineryModal(false);
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  }
};
const deleteMachineryItem = async (id) => {
  const machineToDelete = machinery.find(item => item.id === id);
  
  if (!machineToDelete) {
    alert('Machine not found');
    return;
  }

  const relatedServiceRecords = serviceHistory.filter(
    record => record.machineName === machineToDelete.name
  );
  const serviceCount = relatedServiceRecords.length;

  const confirmMessage = serviceCount > 0
    ? `Are you sure you want to delete "${machineToDelete.name}"?\n\nThis will also delete ${serviceCount} service record${serviceCount === 1 ? '' : 's'} associated with this machine.`
    : `Are you sure you want to delete "${machineToDelete.name}"?`;

  if (!confirm(confirmMessage)) return;

  try {
    await supabase.from('machinery_items').delete().eq('id', id);
    
    if (serviceCount > 0) {
      await supabase.from('service_records')
        .delete()
        .eq('machine_name', machineToDelete.name);
      
      // ✅ Remove associated service records from local state
      setServiceHistory(prev => 
        prev.filter(record => record.machineName !== machineToDelete.name)
      );
    }

    // ✅ Remove machine from local state immediately
    setMachinery(prev => prev.filter(item => item.id !== id));

    console.log(`✅ Deleted machine "${machineToDelete.name}" and ${serviceCount} service record(s)`);
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};
const startEditMachinery = (item) => {
  isEditingRef.current = true;
  setEditingMachineryId(item.id);
setMachineryForm({
  name: item.name || '',
  vinSerial: item.vinSerial || '',
  category: item.category || '',
  status: item.status || 'Active',
  photoUrl: item.photoUrl || '',
  requirements: item.requirements || '',
  tracking_type: item.tracking_type || '',
  licensePlate: item.licensePlate || ''
});
};
const saveMachineryEdit = async (id) => {
  setSavingMachinery(true);
  try {
const oldName = machinery.find(item => item.id === id)?.name;
const newName = machineryForm.name;
const nameChanged = oldName && newName && oldName !== newName;

const updates = {
  name: newName,
  vin_serial: machineryForm.vinSerial,
  category: machineryForm.category,
  status: machineryForm.status,
  photo_url: machineryForm.photoUrl || '',
  requirements: machineryForm.requirements || '',
  tracking_type: machineryForm.tracking_type || null,
  license_plate: machineryForm.licensePlate || ''
};

if (nameChanged) {
  await Promise.all([
    supabase.from('service_records').update({ machine_name: newName }).eq('machine_name', oldName),
    supabase.from('machine_hours').update({ machine_name: newName }).eq('machine_name', oldName),
    supabase.from('machine_km').update({ machine_name: newName }).eq('machine_name', oldName),
    supabase.from('service_reminders').update({ machine_name: newName }).eq('machine_name', oldName),
  ]);
}

await supabase.from('machinery_items').update(updates).eq('id', id);

if (nameChanged) {
  setServiceHistory(prev => prev.map(r =>
    r.machineName === oldName ? { ...r, machineName: newName } : r
  ));
  setMachineHours(prev => prev.map(r =>
    r.machine_name === oldName ? { ...r, machine_name: newName } : r
  ));
  setMachineKm(prev => prev.map(r =>
    r.machine_name === oldName ? { ...r, machine_name: newName } : r
  ));
  setServiceReminders(prev => prev.map(r =>
    r.machine_name === oldName ? { ...r, machine_name: newName } : r
  ));
}

setMachinery(prev => prev.map(item => 
  item.id === id ? {
    id: item.id,
    name: updates.name,
    vinSerial: updates.vin_serial,
    category: updates.category,
    status: updates.status,
    photoUrl: updates.photo_url,
    requirements: updates.requirements,
    tracking_type: updates.tracking_type || '',
    licensePlate: updates.license_plate || ''
  } : item
));

    console.log('✅ Machinery updated - FAST!');
    setEditingMachineryId(null);
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
} catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
  } finally {
    setSavingMachinery(false);
  }
};

const cancelMachineryEdit = () => {
  setEditingMachineryId(null);
  isEditingRef.current = false;
  setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '', requirements: '', tracking_type: '', licensePlate: '' });
};
  
const viewMachineServiceHistory = (machineName) => {
  setServiceFilter(machineName);
  setServiceSearch('');
  setActiveTab('service');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  
const addServiceRecord = async () => {
  if (savingService) return;
  if (!serviceForm.machineName) {
    alert('Please select a machine');
    return;
  }

  setSavingService(true);
  
  // Generate the ID ONCE — before the try block so it never changes on retry
  const newId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
  const finalDate = serviceForm.date || new Date().toISOString().split('T')[0];

  try {
    let error = null;

    // iOS Safari cold-connection retry: first fetch to Supabase often fails
    // on the first attempt. Retry once with a short delay before surfacing error.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const result = await supabase.from('service_records').insert([{
        id: newId,
        user_id: user.id,
        machine_name: serviceForm.machineName,
        service_type: serviceForm.serviceType,
        date: finalDate,
        notes: serviceForm.notes,
        technician: serviceForm.technician,
        photo_urls: JSON.stringify(serviceForm.photoUrls || [])
      }]);
      error = result.error;

      if (!error) break; // success — stop retrying

      const isDuplicateKey = error.code === '23505';
      if (isDuplicateKey) {
        // Record already made it in on a previous attempt — treat as success
        console.warn('Duplicate key — record already saved, updating local state only');
        error = null;
        break;
      }

      if (attempt === 1) {
        console.warn(`Service record insert failed (attempt 1), retrying in 800ms...`, error);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    if (error) {
      throw error;
    }

    setServiceHistory(prev => [{
      id: newId,
      machineName: serviceForm.machineName,
      serviceType: serviceForm.serviceType,
      date: finalDate,
      notes: serviceForm.notes,
      technician: serviceForm.technician,
      photoUrls: serviceForm.photoUrls || []
    }, ...prev]);

    console.log('✅ Service saved');
    setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrls: [] });
    setShowServiceModal(false);

  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  } finally {
    setSavingService(false);
  }
};
const deleteServiceRecord = async (id) => {
  if (!confirm('Are you sure you want to delete this service record?')) return;
  try {
    const { error } = await supabase.from('service_records').delete().eq('id', id);
    if (error) throw error;
    setServiceHistory(prev => prev.filter(item => item.id !== id));
    console.log('✅ Service record deleted');
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};
const startEditService = (record) => {
  isEditingRef.current = true;
  setEditingServiceId(record.id);
  setServiceForm({
    machineName: record.machineName || '',
    serviceType: record.serviceType || '',
    date: record.date || '',
    notes: record.notes || '',
    technician: record.technician || '',
    photoUrls: record.photoUrls || []
  });
};

const saveServiceEdit = async (id) => {
  setSavingService(true);
  try {
    const updates = {
      machine_name: serviceForm.machineName,
      service_type: serviceForm.serviceType,
      date: serviceForm.date,
      notes: serviceForm.notes,
      technician: serviceForm.technician,
      photo_urls: JSON.stringify(serviceForm.photoUrls || [])
    };
    
    await supabase.from('service_records').update(updates).eq('id', id);

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setServiceHistory(prev => prev.map(item => 
      item.id === id ? {
        id: item.id,
        machineName: updates.machine_name,
        serviceType: updates.service_type,
        date: updates.date,
        notes: updates.notes,
        technician: updates.technician,
        photoUrls: serviceForm.photoUrls || []  // ✅ USE ARRAY, NOT STRING
      } : item
    ));

    console.log('✅ Service updated - FAST!');
    setEditingServiceId(null);
    setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrls: [] });
    setMachineSearchModal('');
  } catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
  } finally {
    setSavingService(false);
  }
};
const cancelServiceEdit = () => {
  setEditingServiceId(null);
  isEditingRef.current = false;
  setServiceForm({ 
    machineName: '', 
    serviceType: '', 
    date: '', 
    notes: '', 
    technician: '', 
    photoUrls: [] 
  });
  setMachineSearchModal('');
  setMachineDropdownOpen(false);
};

const openHoursDetail = (machine) => {
  const record = machineHours.find(h => h.machine_name === machine.name);
  setSelectedHoursRecord({ machine, record });
  setNewTotalHours(record ? parseFloat(record.current_hours).toFixed(1) : '0');
  setEditingHours(false);
  setShowHoursDetailModal(true);
};

const saveHoursEdit = async () => {
  if (!selectedHoursRecord) return;
  const machineName = selectedHoursRecord.machine.name;
  const newHours = parseFloat(newTotalHours);
  if (isNaN(newHours) || newHours < 0) {
    alert('Please enter a valid number');
    return;
  }
  try {
    const existing = machineHours.find(h => h.machine_name === machineName);
    if (existing && existing.id) {
      const { error } = await supabase.from('machine_hours').update({
        current_hours: newHours,
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);
      if (error) { console.error('❌ hours update error:', error); alert('Failed to save hours: ' + error.message); return; }
      setMachineHours(prev => prev.map(item =>
        item.id === existing.id ? { ...item, current_hours: newHours } : item
      ));
    } else {
      const { data, error: insertError } = await supabase.from('machine_hours').insert([{
        machine_name: machineName,
        current_hours: newHours,
        user_id: user.id
      }]).select();
      if (insertError) { console.error('❌ hours insert error:', insertError); alert('Failed to save hours: ' + insertError.message); return; }
      if (data && data.length > 0) {
        setMachineHours(prev => {
          const filtered = prev.filter(h => h.machine_name !== machineName);
          return [...filtered, data[0]];
        });
      }
    }
    setEditingHours(false);
    setShowHoursDetailModal(false);
  } catch (error) {
    alert('Failed to save hours: ' + error.message);
  }
};
const deleteHoursRecord = async () => {
  if (!selectedHoursRecord?.record) return;
  if (!confirm('Delete all hours for this machine? This cannot be undone.')) return;
  try {
    await supabase.from('machine_hours').delete().eq('id', selectedHoursRecord.record.id);
    setShowHoursDetailModal(false);
  } catch (error) {
    alert('Failed to delete hours');
  }
};
  
// Get machine hours
const getMachineHours = (machineName) => {
  const record = machineHours.find(h => h.machine_name === machineName);
  return record ? parseFloat(record.current_hours || 0) : 0;
};

// Get active reminders for a machine
const getMachineReminders = (machineName) => {
  return serviceReminders.filter(r => 
    r.machine_name === machineName && !r.deleted_at
  );
};

// Check if reminder is due
const isReminderDue = (reminder, currentHours) => {
  const hoursSinceLastService = currentHours - (parseFloat(reminder.last_service_hours) || 0);
  const interval = parseFloat(reminder.hours_interval) || 0;
  return hoursSinceLastService >= interval;
};

// Add hours to machine
const addMachineHours = async () => {
  if (!hoursForm.machineName || !hoursForm.hoursToAdd) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const hoursToAdd = parseFloat(hoursForm.hoursToAdd);
    if (hoursToAdd <= 0) {
      alert('Hours must be greater than 0');
      return;
    }

    const existingRecord = machineHours.find(h => h.machine_name === hoursForm.machineName);
    
    if (existingRecord) {
  const newTotal = parseFloat(existingRecord.current_hours) + hoursToAdd;
  await supabase.from('machine_hours').update({
    current_hours: newTotal,
    updated_at: new Date().toISOString()
  }).eq('id', existingRecord.id);
  setMachineHours(prev => prev.map(item =>
    item.id === existingRecord.id ? { ...item, current_hours: newTotal } : item
  ));
} else {
  const { data, error: insertError } = await supabase.from('machine_hours').insert([{
    id: Date.now().toString(),
    machine_name: hoursForm.machineName,
    current_hours: hoursToAdd,
    user_id: user.id
  }]).select();
  if (!insertError && data?.[0]) {
    setMachineHours(prev => [...prev, data[0]]);
  }
}

setHoursForm({ machineName: '', hoursToAdd: '' });
setShowHoursModal(false);

// Refresh hours from DB to ensure dropdown stays current
const { data: freshHours } = await supabase
  .from('machine_hours')
  .select('*')
  .order('machine_name', { ascending: true });
if (freshHours) setMachineHours(freshHours);

alert(`Added ${hoursToAdd} hours to ${hoursForm.machineName}`);
  } catch (error) {
    console.error('Error adding hours:', error);
    alert('Failed to add hours');
  }
};

// Create service reminder
const createReminder = async () => {
  if (!selectedMachineForReminder || !reminderForm.reminderName || !reminderForm.hoursInterval) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const interval = parseFloat(reminderForm.hoursInterval);
    if (interval <= 0) {
      alert('Hours interval must be greater than 0');
      return;
    }

    const currentHours = getMachineHours(selectedMachineForReminder);

    const existing = serviceReminders.find(r =>
  r.machine_name === selectedMachineForReminder &&
  r.reminder_name === reminderForm.reminderName &&
  r.reminder_type === 'hours' &&
  !r.deleted_at
);

if (existing) {
  alert(`A reminder called "${reminderForm.reminderName}" already exists for ${selectedMachineForReminder}.`);
  return;
}

const { error: insertError } = await supabase.from('service_reminders').insert([{
  machine_name: selectedMachineForReminder,
  reminder_name: reminderForm.reminderName,
  reminder_type: 'hours',
  hours_interval: interval,
  last_service_hours: currentHours,
  is_active: true,
  user_id: user.id
}]);

if (insertError) {
  console.error('❌ createReminder error:', insertError);
  alert('Failed to create reminder: ' + insertError.message);
  return;
}
    setReminderForm({ reminderName: '', hoursInterval: '' });
    setSelectedMachineForReminder('');
    setShowReminderModal(false);
    alert('Reminder created!');
  } catch (error) {
    console.error('Error creating reminder:', error);
    alert('Failed to create reminder');
  }
};

// Mark reminder as completed
const completeReminder = (reminderId) => {
  const reminder = serviceReminders.find(r => r.id === reminderId);
  if (!reminder) return;
  const currentHours = getMachineHours(reminder.machine_name);
  setCompletingReminder({ ...reminder, currentHours });
  setCompleteServiceForm({
    logService: null,
    serviceType: reminder.reminder_name || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    technician: '',
  });
  setShowCompleteReminderModal(true);
};

  const handleCompleteReminderSubmit = async (shouldLog) => {
  if (!completingReminder) return;
  try {
    const isKm = completingReminder.reminder_type === 'km';
    const now = new Date().toISOString();
    const currentMetric = isKm ? completingReminder.currentKm : completingReminder.currentHours;

    const updates = isKm ? {
      last_service_km: completingReminder.currentKm,
      completed_at: now,
      completed_at_metric: currentMetric
    } : {
      last_service_hours: completingReminder.currentHours,
      completed_at: now,
      completed_at_metric: currentMetric
    };

    const { error } = await supabase.from('service_reminders')
      .update(updates)
      .eq('id', completingReminder.id);

    if (error) { alert('Failed to complete reminder: ' + error.message); return; }

    setServiceReminders(prev => prev.map(r =>
      r.id === completingReminder.id ? { ...r, ...updates } : r
    ));

    if (shouldLog) {
      const metric = isKm
        ? `${completingReminder.currentKm?.toFixed(1)} km`
        : `${completingReminder.currentHours?.toFixed(1)} hrs`;

      const newId = Date.now().toString();
      const finalDate = completeServiceForm.date || new Date().toISOString().split('T')[0];
      const fullNotes = completeServiceForm.notes
        ? `${completeServiceForm.notes}\n\n[Logged via reminder — ${metric} at time of service]`
        : `[Logged via reminder — ${metric} at time of service]`;

      await supabase.from('service_records').insert([{
        id: newId,
        user_id: user.id,
        machine_name: completingReminder.machine_name,
        service_type: completeServiceForm.serviceType,
        date: finalDate,
        notes: fullNotes,
        technician: completeServiceForm.technician,
        photo_urls: JSON.stringify([])
      }]);

      setServiceHistory(prev => [{
        id: newId,
        machineName: completingReminder.machine_name,
        serviceType: completeServiceForm.serviceType,
        date: finalDate,
        notes: fullNotes,
        technician: completeServiceForm.technician,
        photoUrls: []
      }, ...prev]);
    }

    setShowCompleteReminderModal(false);
    setCompletingReminder(null);
    setCompleteServiceForm({
      logService: null,
      serviceType: '',
      date: '',
      notes: '',
      technician: '',
    });

  } catch (error) {
    console.error('Error completing reminder:', error);
    alert('Failed to complete reminder');
  }
};

const loadDeletedReminders = async () => {
  try {
    const { data, error } = await supabase
      .from('service_reminders')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) { alert('Failed to load deleted reminders'); return; }
    setDeletedReminders(data || []);
    setShowDeletedRemindersModal(true);
  } catch (error) {
    alert('Failed to load deleted reminders');
  }
};

const restoreReminder = (reminderId) => {
  const reminder = deletedReminders.find(r => r.id === reminderId);
  if (!reminder) return;
  setPendingRestoreReminder(reminder);
  setRestoreChoice(null);
  setShowRestoreChoiceModal(true);
};

const confirmRestoreReminder = async () => {
  if (!pendingRestoreReminder || !restoreChoice) return;
  const reminder = pendingRestoreReminder;
  try {
    setRestoringReminder(reminder.id);
    const isKm = reminder.reminder_type === 'km';
    const currentMetric = isKm ? getMachineKm(reminder.machine_name) : getMachineHours(reminder.machine_name);

    const lastMetric = restoreChoice === 'fresh'
      ? currentMetric
      : (isKm ? parseFloat(reminder.last_service_km || 0) : parseFloat(reminder.last_service_hours || 0));

    const updates = {
      deleted_at: null,
      is_active: true,
      completed_at: null,
      completed_at_metric: null,
      ...(isKm
        ? { last_service_km: lastMetric }
        : { last_service_hours: lastMetric }
      )
    };

    const { error } = await supabase
      .from('service_reminders')
      .update(updates)
      .eq('id', reminder.id);

    if (error) { alert('Failed to restore reminder: ' + error.message); return; }

    setServiceReminders(prev => {
      const exists = prev.find(r => r.id === reminder.id);
      if (exists) {
        return prev.map(r => r.id === reminder.id ? { ...r, ...updates } : r);
      } else {
        return [...prev, { ...reminder, ...updates }];
      }
    });

    setDeletedReminders(prev => prev.filter(r => r.id !== reminder.id));
    setShowRestoreChoiceModal(false);
    setPendingRestoreReminder(null);
    setRestoreChoice(null);
    setRestoringReminder(null);

  } catch (error) {
    console.error('Error restoring reminder:', error);
    alert('Failed to restore reminder');
    setRestoringReminder(null);
  }
};

// Delete reminder
const deleteReminder = async (reminderId) => {
  if (!confirm('Delete this reminder?')) return;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase.from('service_reminders').update({
      deleted_at: now,
      is_active: false
    }).eq('id', reminderId);
    if (error) { alert('Failed to delete reminder: ' + error.message); return; }
    setServiceReminders(prev => prev.map(r =>
      r.id === reminderId ? { ...r, deleted_at: now, is_active: false } : r
    ));
  } catch (error) {
    console.error('Error deleting reminder:', error);
    alert('Failed to delete reminder');
  }
};

const getMachineKm = (machineName) => {
  const record = machineKm.find(h => h.machine_name === machineName);
  return record ? parseFloat(record.current_km || 0) : 0;
};

const getMachineKmReminders = (machineName) => {
  return serviceReminders.filter(r =>
    r.machine_name === machineName && !r.deleted_at && r.reminder_type === 'km'
  );
};

const isKmReminderDue = (reminder, currentKm) => {
  const kmSinceLastService = currentKm - (parseFloat(reminder.last_service_km) || 0);
  const interval = parseFloat(reminder.km_interval) || 0;
  return kmSinceLastService >= interval;
};

const addMachineKm = async () => {
  if (!kmForm.machineName || !kmForm.kmToAdd) {
    alert('Please fill in all fields');
    return;
  }
  try {
    const kmToAdd = parseFloat(kmForm.kmToAdd);
    if (kmToAdd <= 0) { alert('km must be greater than 0'); return; }
    const existingRecord = machineKm.find(h => h.machine_name === kmForm.machineName);
    if (existingRecord) {
      const newTotal = parseFloat(existingRecord.current_km) + kmToAdd;
      await supabase.from('machine_km').update({
        current_km: newTotal,
        updated_at: new Date().toISOString()
      }).eq('id', existingRecord.id);
    } else {
      await supabase.from('machine_km').insert([{
        id: Date.now().toString(),
        machine_name: kmForm.machineName,
        current_km: kmToAdd,
        user_id: user.id
      }]);
    }
setKmForm({ machineName: '', kmToAdd: '' });
setShowKmModal(false);

const { data: freshKm } = await supabase
  .from('machine_km')
  .select('*')
  .order('machine_name', { ascending: true });
if (freshKm) setMachineKm(freshKm);

alert(`Added ${kmToAdd} km to ${kmForm.machineName}`);
  } catch (error) {
    alert('Failed to add km');
  }
};

const openKmDetail = (machine) => {
  const record = machineKm.find(h => h.machine_name === machine.name);
  setSelectedKmRecord({ machine, record });
  setNewTotalKm(record ? parseFloat(record.current_km).toFixed(1) : '0');
  setEditingKm(false);
  setShowKmDetailModal(true);
};

const saveKmEdit = async () => {
  if (!selectedKmRecord) return;
  const machineName = selectedKmRecord.machine.name;
  const newKm = parseFloat(newTotalKm);
  if (isNaN(newKm) || newKm < 0) { alert('Please enter a valid number'); return; }
  try {
    const existing = machineKm.find(h => h.machine_name === machineName);
    if (existing && existing.id) {
      const { error } = await supabase.from('machine_km').update({
        current_km: newKm,
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);
      if (error) { console.error('❌ km update error:', error); alert('Failed to save km: ' + error.message); return; }
      setMachineKm(prev => prev.map(item =>
        item.id === existing.id ? { ...item, current_km: newKm } : item
      ));
    } else {
      const { data, error } = await supabase.from('machine_km').insert([{
        machine_name: machineName,
        current_km: newKm,
        user_id: user.id
      }]).select();
      if (error) { console.error('❌ km insert error:', error); alert('Failed to save km: ' + error.message); return; }
      if (data && data[0]) {
        setMachineKm(prev => {
          const filtered = prev.filter(h => h.machine_name !== machineName);
          return [...filtered, data[0]];
        });
      }
    }
    setEditingKm(false);
    setShowKmDetailModal(false);
  } catch (error) {
    console.error('❌ saveKmEdit catch:', error);
    alert('Failed to save km: ' + error.message);
  }
};
  
const deleteKmRecord = async () => {
  if (!selectedKmRecord?.record) return;
  if (!confirm('Delete all km for this machine?')) return;
  try {
    await supabase.from('machine_km').delete().eq('id', selectedKmRecord.record.id);
    setShowKmDetailModal(false);
  } catch (error) {
    alert('Failed to delete km record');
  }
};

const createKmReminder = async () => {
  if (!selectedMachineForReminder || !reminderForm.reminderName || !reminderForm.kmInterval) {
    alert('Please fill in all fields');
    return;
  }
  try {
    const interval = parseFloat(reminderForm.kmInterval);
    if (interval <= 0) { alert('km interval must be greater than 0'); return; }
    const currentKm = getMachineKm(selectedMachineForReminder);
    const { error } = await supabase.from('service_reminders').insert([{
      machine_name: selectedMachineForReminder,
      reminder_name: reminderForm.reminderName,
      reminder_type: 'km',
      km_interval: interval,
      last_service_km: currentKm,
      is_active: true,
      user_id: user.id
    }]);
    if (error) {
      console.error('❌ createKmReminder error:', error);
      alert('Failed to create km reminder: ' + error.message);
      return;
    }
    setReminderForm({ reminderName: '', hoursInterval: '', kmInterval: '' });
    setSelectedMachineForReminder('');
    setShowKmReminderModal(false);
  } catch (error) {
    console.error('❌ createKmReminder catch:', error);
    alert('Failed to create km reminder: ' + error.message);
  }
};

const completeKmReminder = (reminderId) => {
  const reminder = serviceReminders.find(r => r.id === reminderId);
  if (!reminder) return;
  const currentKm = getMachineKm(reminder.machine_name);
  setCompletingReminder({ ...reminder, currentKm });
  setCompleteServiceForm({
    logService: null,
    serviceType: reminder.reminder_name || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    technician: '',
  });
  setShowCompleteReminderModal(true);
};
 const saveCalendarNote = async (key, text) => {
  if (!key) return;
  setCalendarSaving(true);
  setCalendarSaved(false);
  const [monthIndex, weekNumber] = key.split('-').map(Number);
  try {
    const existing = calendarNotes[key] !== undefined;
    if (existing || text.trim()) {
const ADMIN_USER_ID = '001f830b-05d1-4f2d-ba0c-846a6acd3fae';
const { error } = await supabase
        .from('calendar_notes')
        .upsert([{
          id: `${ADMIN_USER_ID}-${key}`,
          user_id: ADMIN_USER_ID,
          month_index: monthIndex,
          week_number: weekNumber,
          note: text,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
      if (error) throw error;
    }
    setCalendarNotes(prev => ({ ...prev, [key]: text.trim() }));
    setCalendarSaved(true);
    setCalendarNoteDirty(false);
    setTimeout(() => setCalendarSaved(false), 2500);
  } catch (error) {
    console.error('❌ Calendar note save error:', error);
    alert('Failed to save note: ' + error.message);
  } finally {
    setCalendarSaving(false);
  }
}; 
const generateQRDataUrl = (item) => {
  const url = `https://agritrack-manager.vercel.app/#inventory/${item.id}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}`;
};

const printInventoryQR = (item) => {
 const appUrl = `https://agritrack-manager.vercel.app/#inventory/${item.id}`;
  const url = appUrl;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>QR - ${item.name}</title>
<style>
  body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; background: white; }
  .label { display: flex; flex-direction: column; align-items: center; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; max-width: 260px; width: 100%; }
  h2 { font-size: 1rem; font-weight: bold; margin: 12px 0 4px; text-align: center; word-break: break-word; }
  p { font-size: 0.75rem; color: #6b7280; margin: 2px 0; text-align: center; }
  #qr { margin-bottom: 4px; }
  .print-btn { margin-top: 16px; padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: bold; }
  @media print { .print-btn { display: none; } body { min-height: unset; } }
</style></head><body>
<div class="label">
  <div id="qr"></div>
  <h2>${item.name}</h2>
  ${item.partNumber ? `<p>Part #: ${item.partNumber}</p>` : ''}
  ${item.location ? `<p>Location: ${item.location}</p>` : ''}
  <a href="${appUrl}" style="font-size:0.65rem;color:#0891b2;margin-top:6px;word-break:break-all;text-align:center;display:block;">Open in AgriTrack</a>
</div>
<button class="print-btn" onclick="window.print()">🖨 Print Label</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>
  window.onload = function() {
    new QRCode(document.getElementById('qr'), {
      text: ${JSON.stringify(url)},
      width: 180,
      height: 180,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  };
<\/script>
</body></html>`);
  w.document.close();
};

const quickUpdateQuantity = async (id, delta) => {
  const item = inventory.find(i => i.id === id);
  if (!item) return;

  const originalQuantity = item.quantity;
  const newQuantity = Math.max(0, (parseInt(item.quantity) || 0) + delta).toString();

  // Update local state immediately for responsive feel
  setInventory(prev => prev.map(i => 
    i.id === id ? { ...i, quantity: newQuantity } : i
  ));

  recentlyUpdatedIdsRef.current.add(id);
  setTimeout(() => {
    recentlyUpdatedIdsRef.current.delete(id);
  }, 15000);

  try {
    let result = await supabase.from('inventory_items').update({
      quantity: newQuantity
    }).eq('id', id);

    // Retry once on failure
    if (result.error) {
      console.warn('Quantity update failed, retrying...', result.error);
      await new Promise(r => setTimeout(r, 800));
      result = await supabase.from('inventory_items').update({
        quantity: newQuantity
      }).eq('id', id);
    }

    if (result.error) throw result.error;

    console.log('✅ Quantity updated and saved!');
  } catch (error) {
    console.error('Quantity update error:', error);

    // Revert local state back to original since the save failed
    setInventory(prev => prev.map(i =>
      i.id === id ? { ...i, quantity: originalQuantity } : i
    ));

    // Also remove from the guard since the update didn't actually land
    recentlyUpdatedIdsRef.current.delete(id);

    alert('❌ Failed to update quantity — your change has been reversed.\n\nPlease try again. If this keeps happening, check your internet connection.');
  }
};

  // Styles object - NOW USES currentTheme WHICH IS DEFINED
  const styles = {
   loginContainer: {
  minHeight: '100vh',
  background: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  position: 'relative',
},
loginCard: {
  background: 'rgba(255, 255, 255, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '16px',
  padding: '30px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(16px)',
},
    loginTitle: {
      fontSize: '1.25rem',
      fontWeight: 'normal',
      color: '#d1d5db',
      marginBottom: '8px',
      textAlign: 'center',
      lineHeight: '1.4',
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    loginSubtitle: {
      color: '#9ca3af',
      fontSize: '0.8rem',
      textAlign: 'center',
      marginTop: '20px',
    },
    loginFooter: {
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#9ca3af',
      fontSize: '0.75rem',
      textAlign: 'center',
    },
    loginInput: {
      width: '100%',
      padding: '14px 16px',
      background: '#111827',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      color: 'white',
      fontSize: '1rem',
      boxSizing: 'border-box',
      outline: 'none',
    },
    loginButton: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(to right, #10b981, #06b6d4)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: '8px',
    },
    loginError: {
      padding: '12px',
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      color: '#111827',
      fontSize: '0.875rem',
    },
container: {
  minHeight: '100vh',
  color: currentTheme.text,
  padding: '24px',
},
homeContainer: {
  minHeight: '500px',
  borderRadius: '16px',
  padding: '24px',
  backdropFilter: 'blur(5px)',
},
    content: {
      maxWidth: '1600px',
      margin: '0 auto',
    },
  loading: {
  minHeight: '100vh',
  background: 'linear-gradient(to bottom right, #1a202c, #2d3748)',
  backgroundAttachment: 'fixed',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
},
    spinner: {
      width: '64px',
      height: '64px',
      border: '4px solid #4b5563',
      borderTopColor: '#10b981',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #10b981, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
      textAlign: 'center',
    },
    subtitle: {
      color: currentTheme.textSecondary,
      marginBottom: '8px',
    },
    stats: {
      color: currentTheme.textSecondary,
      fontSize: '0.875rem',
    },
    statusContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    syncingBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'rgba(16, 185, 129, 0.2)',
      border: '1px solid #10b981',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#10b981',
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      border: '1px solid',
      borderRadius: '8px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      background: 'transparent',
    },
   logoutButton: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  background: theme === 'light' ? '#bae6fd' : '#2563eb',
  border: 'none',
  borderRadius: '8px',
  color: theme === 'light' ? '#0c4a6e' : 'white',
  cursor: 'pointer',
  fontSize: '0.875rem',
},
    lastSyncBanner: {
      padding: '12px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '8px',
      marginBottom: '24px',
      fontSize: '0.875rem',
      color: '#9ca3af',
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid #4b5563',
      flexWrap: 'wrap',
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px 8px 0 0',
      color: currentTheme.text,
      cursor: 'pointer',
      fontSize: '1rem',
    },
    settingsDropdownWrapper: {
      position: 'relative',
    },
    settingsDropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '4px',
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      minWidth: '200px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      overflow: 'hidden',
    },
dropdownItem: {
  width: '100%',
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(37, 99, 235, 0.3)',
  color: currentTheme.text,
  cursor: 'pointer',
  fontSize: '0.875rem',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background 0.2s ease',
},
    welcomeCard: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '24px',
      backdropFilter: 'blur(5px)',
    },
    syncStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      background: 'rgba(16, 185, 129, 0.3)',
      borderRadius: '8px',
      marginTop: '16px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
    },
    statCard: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid #10b981',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    },
    tabHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    searchSortContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: 1,
      minWidth: '250px',
      padding: '12px 16px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      outline: 'none',
    },
    sortSelect: {
      padding: '12px 16px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '180px',
    },
addButton: {
  padding: '12px 24px',
  background: theme === 'light' ? '#86efac' : '#10b981',
  border: 'none',
  borderRadius: '8px',
  color: theme === 'light' ? '#14532d' : 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
},
    emptyState: {
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      padding: '48px',
      textAlign: 'center',
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
itemCard: {
  background: currentTheme.cardBackground,
  border: `1px solid ${currentTheme.cardBorder}`,
  borderRadius: '12px',
  paddingTop: '16px',
  paddingBottom: '16px',
  paddingLeft: isDesktop ? '24px' : '4px',
  paddingRight: isDesktop ? '24px' : '4px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  gap: '16px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  cursor: 'pointer',
},
itemDetails: {
  marginTop: '16px',
  display: 'grid',
  gridTemplateColumns: isDesktop ? 'repeat(4, minmax(120px, 1fr))' : 'repeat(2, 1fr)',
  gap: '16px',
},
  editButton: {
  padding: '8px',
  background: theme === 'light' ? '#86efac' : '#0891b2',
  border: 'none',
  borderRadius: '8px',
  color: theme === 'light' ? '#14532d' : 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
   deleteButton: {
  padding: '8px',
  background: theme === 'light' ? '#fca5a5' : '#7f1d1d',
  border: 'none',
  borderRadius: '8px',
  color: theme === 'light' ? '#7f1d1d' : 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '40px',
  minHeight: '40px',
  touchAction: 'manipulation',
},
    saveButton: {
      padding: '10px 20px',
      background: '#10b981',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
    },
    cancelButton: {
      padding: '10px 20px',
      background: '#4b5563',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
    },
quantityButton: {
  width: !isDesktop ? '24px' : '32px',
  height: !isDesktop ? '24px' : '32px',
  flexShrink: 0,
  background: theme === 'light' ? '#86efac' : '#10b981',
  border: 'none',
  borderRadius: '6px',
  color: theme === 'light' ? '#14532d' : 'white',
  cursor: 'pointer',
fontSize: !isDesktop ? '1rem' : '1.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50,
    },
    modal: {
      background: currentTheme.modalBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    closeButton: {
      background: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      color: 'white',
      cursor: 'pointer',
    },
    input: {
      width: '100%',
      padding: '12px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '1rem',
      marginBottom: '16px',
      boxSizing: 'border-box',
    },
    primaryButton: {
      flex: 1,
      padding: '12px',
      background: '#10b981',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      flex: 1,
      padding: '12px',
      background: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    debugInfo: {
      background: '#1a2942',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
    },
    stockBadgeLow: {
      padding: '4px 12px',
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      fontSize: '0.75rem',
      color: '#ef4444',
      fontWeight: 'bold',
    },
    stockBadgeHigh: {
      padding: '4px 12px',
      background: 'rgba(251, 191, 36, 0.2)',
      border: '1px solid #fbbf24',
      borderRadius: '12px',
      fontSize: '0.75rem',
      color: '#fbbf24',
      fontWeight: 'bold',
    },
  };

 if (loading) {
    return (
      <LoadingScreen />
    );
  }

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        {/* Dahlton Ag Ventures Logo */}
      <div style={{
  width: '120px',
  height: '120px',
  background: 'rgba(255, 255, 255, 0.25)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '70px',
  boxShadow: '0 0 60px rgba(255, 255, 255, 0.5), 0 20px 40px rgba(0, 0, 0, 0.4)',
  padding: '5px',
  animation: 'floatIn 1s ease-out'
}}>
<img 
  src="/dav-logo.png"
  alt="Dahlton Ag Ventures" 
  style={{ 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain',
    marginLeft: '-6px'
  }} 
  onLoad={(e) => {
    // Load actual logo
    e.target.src = '/dav-logo.png';
  }}
/>
      </div>
        <div style={{ ...styles.loginCard, marginTop: '-40px' }}>
          <h2 style={{
  fontSize: '1.75rem',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '8px',
  textAlign: 'center',
  lineHeight: '1.4',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
}}>
  Welcome to
</h2>
<h1 style={{
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(to right, #10b981, #22d3ee)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '8px',
  textAlign: 'center',
  filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))'
}}>
  AgriTrack Manager
</h1>

<form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={styles.loginInput}
              required
              autoComplete="email"
            />
            <div style={{ position: 'relative', width: '100%' }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={loginPassword}
    onChange={(e) => setLoginPassword(e.target.value)}
    style={styles.loginInput}
    required
    autoComplete="current-password"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem'
    }}
    tabIndex={-1}
  >
    {showPassword ? '👁️' : '👁️‍🗨️'}
  </button>
</div>
  
{/* Forgot Password Link */}
  <button
    type="button"
    onClick={() => {
      setShowPasswordRecovery(true);
      setLoginError('');
    }}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#06b6d4',
      cursor: 'pointer',
      fontSize: '0.875rem',
      textAlign: 'right',
      padding: '0',
      marginTop: '-8px',
      textDecoration: 'underline',
      alignSelf: 'flex-end'
    }}
  >
    Forgot Password?
  </button>
            {loginError && (
              <div style={styles.loginError}>
                {loginError}
              </div>
            )}
 {showPasswordRecovery && (
    <div style={{
      padding: '16px',
      background: 'rgba(6, 182, 212, 0.1)',
      border: '1px solid #06b6d4',
      borderRadius: '8px',
      marginTop: '8px'
    }}>
      <h4 style={{ 
        color: '#06b6d4', 
        marginBottom: '8px',
        fontSize: '1rem',
        fontWeight: 'bold'
      }}>
        Reset Password
      </h4>
      <p style={{ 
        color: '#d1d5db', 
        fontSize: '0.875rem',
        marginBottom: '12px' 
      }}>
        Enter your email to receive a password reset link
      </p>
      
      <input
        type="email"
        placeholder="Enter your email"
        value={recoveryEmail}
        onChange={(e) => setRecoveryEmail(e.target.value)}
        style={{
          ...styles.loginInput,
          marginBottom: '12px'
        }}
      />
      
      {recoveryError && (
        <div style={{
          ...styles.loginError,
          marginBottom: '12px'
        }}>
          {recoveryError}
        </div>
      )}
      
      {recoveryMessage && (
        <div style={{
          padding: '12px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          color: '#10b981',
          fontSize: '0.875rem',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Mail size={16} />
          {recoveryMessage}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={handlePasswordRecovery}
          disabled={sendingRecovery || !recoveryEmail.trim()}
          style={{
            flex: 1,
            padding: '10px',
            background: sendingRecovery || !recoveryEmail.trim() ? '#6b7280' : '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: sendingRecovery || !recoveryEmail.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {sendingRecovery ? (
            <>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : (
            <>
              <Mail size={14} />
              Send Link
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            setShowPasswordRecovery(false);
            setRecoveryEmail('');
            setRecoveryError('');
            setRecoveryMessage('');
          }}
          disabled={sendingRecovery}
          style={{
            flex: 1,
            padding: '10px',
            background: '#374151',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: sendingRecovery ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )}
            <button 
              type="submit" 
              style={styles.loginButton}
              disabled={loggingIn}
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{
  color: '#111827',
  fontSize: '0.9rem',
  textAlign: 'center',
  marginTop: '20px',
  fontWeight: '500',
  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
}}>
  created by Dahlton Ag Ventures
</p>
        </div>

        <div style={styles.loginFooter}>
          powered by Vercel & Supabase
        </div>
      </div>
    );
  }
// PART 4 - MAIN APP RETURN (Insert after login screen)
// This continues from: if (!user) { return ( ... login screen ... ); }

return (
<>
 {/* Fixed Background Layer - Image (never changes) */}
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  zIndex: -2
}} />

{/* Fixed Background Layer - Overlay (only this changes on theme switch) */}
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme === 'dark'
    ? 'rgba(0, 0, 0, 0.85)'
    : 'rgba(255, 248, 240, 0.60)',
  zIndex: -1
}} />
  
  {/* Scrollable Content Layer */}
  <div
    style={{
      minHeight: '100vh',
      color: currentTheme.text,
      padding: '24px',
      position: 'relative'
    }}
  >
    <div style={styles.content}>
      <div style={styles.header}>
<div>
 <p style={{
  fontSize: '1.5rem',
  fontWeight: '700',
  color: theme === 'dark' ? '#06b6d4' : '#111827',
  textShadow: theme === 'dark' 
    ? '2px 2px 4px rgba(0, 0, 0, 0.5)' 
    : '2px 2px 4px rgba(0, 0, 0, 0.2)',
  marginBottom: '8px'
}}>
  AgriTrack Manager
</p>
{userRole && !loading && userRole !== 'employee' && (
  <button
    onClick={() => setActiveTab('admin')}
    style={{ 
      padding: '6px 16px', 
      background: activeTab === 'admin' ? 'linear-gradient(to right, #10b981, #06b6d4)' : 'rgba(16, 185, 129, 0.2)',
      border: `1px solid ${activeTab === 'admin' ? '#06b6d4' : '#10b981'}`,
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: theme === 'dark' ? 'white' : '#1e40af',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '8px'
    }}
    onMouseEnter={(e) => {
      if (activeTab !== 'admin') {
        e.target.style.background = 'rgba(16, 185, 129, 0.3)';
        e.target.style.transform = 'scale(1.05)';
      }
    }}
    onMouseLeave={(e) => {
      if (activeTab !== 'admin') {
        e.target.style.background = 'rgba(16, 185, 129, 0.2)';
        e.target.style.transform = 'scale(1)';
      }
    }}
  >
    {userRole}
  </button>
)}
          </div>
         <div style={styles.statusContainer}>
            
            {syncing && (
              <div style={styles.syncingBadge}>
                <RefreshCw size={12} style={{ animation: 'spin 0.6s linear infinite' }} />
                Syncing...
              </div>
            )}
{realtimeStatus === 'connected' ? (
  <button onClick={() => setShowDebugModal(true)} style={{
    ...styles.statusBadge,
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    color: '#10b981'
  }}>
    <Users size={16} />
    Live Sync Active
  </button>
) : (
  <button onClick={() => setShowDebugModal(true)} style={{
    ...styles.statusBadge,
    background: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    color: '#ef4444'
  }}>
    <AlertCircle size={16} />
    {realtimeStatus === 'connecting' ? 'Connecting...' : 'Connection Lost'}
  </button>
)}
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

       {lastSync && (
  <div style={{
    ...styles.lastSyncBanner,
    color: theme === 'dark' ? '#9ca3af' : '#111827'
  }}>
    Last synced: {lastSync.toLocaleTimeString()}
  </div>
)}

        <div style={styles.tabs}>
{['dashboard', 'inventory', 'machinery', 'service'].map(tab => (
    <button
      key={tab}
      onClick={() => {
  setActiveTab(tab);
  if (tab === 'machinery') {
    setShowRemindersPanel(false);
  }
}}
      style={{
        ...styles.tab,
        background: activeTab === tab ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive
      }}
    >
      {tab === 'dashboard' ? 'Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
      {!loading && tab === 'inventory' && ` (${inventory.length})`}
      {!loading && tab === 'machinery' && ` (${machinery.length})`}
      {!loading && tab === 'service' && ` (${serviceHistory.length})`}
      {loading && (tab === 'inventory' || tab === 'machinery' || tab === 'service') && ' (...)'}
    </button>
  ))}
          {userRole !== 'employee' && (
            <div style={styles.settingsDropdownWrapper} ref={settingsDropdownRef}>
              <button
  onClick={handleSettingsClick}
  style={{
    ...styles.tab,
    background: activeTab === 'settings' ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
              
                Settings {showSettingsDropdown ? '▲' : '▼'}
              </button>
              
              {showSettingsDropdown && (
                <div style={styles.settingsDropdownMenu}>
                  <button
                    style={{
                      ...styles.dropdownItem,
                      background: activeSettingsSection === 'general' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                    }}
                    onClick={() => handleSettingsSectionClick('general')}
                  >
                    ⚙️ General
                  </button>
                  <button
                    style={{
                      ...styles.dropdownItem,
                      background: activeSettingsSection === 'account' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                    }}
                    onClick={() => handleSettingsSectionClick('account')}
                  >
                    👤 Account
                  </button>
                  <button
                    style={{
                      ...styles.dropdownItem,
                      background: activeSettingsSection === 'application' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                    }}
                    onClick={() => handleSettingsSectionClick('application')}
                 > 
                    📊 Application
                  </button>
                  <button
                    style={{
                      ...styles.dropdownItem,
                      background: activeSettingsSection === 'importexport' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                    }}
                    onClick={() => handleSettingsSectionClick('importexport')}
                  >
                    📁 Import/Export Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

{activeTab === 'dashboard' && (
  <div style={styles.homeContainer}>

{(() => {
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12 ? 'Good morning' :
    hour >= 12 && hour < 17 ? 'Good afternoon' :
    hour >= 17 && hour < 21 ? 'Good evening' :
    'Good night';

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  const activeReminders = serviceReminders.filter(r => !r.deleted_at);
  const overdueCount = activeReminders.filter(r => {
    const isKm = r.reminder_type === 'km';
    const current = isKm
      ? (machineKm.find(h => h.machine_name === r.machine_name) ? parseFloat(machineKm.find(h => h.machine_name === r.machine_name).current_km || 0) : 0)
      : (machineHours.find(h => h.machine_name === r.machine_name) ? parseFloat(machineHours.find(h => h.machine_name === r.machine_name).current_hours || 0) : 0);
    const last = isKm ? parseFloat(r.last_service_km || 0) : parseFloat(r.last_service_hours || 0);
    const interval = isKm ? parseFloat(r.km_interval || 0) : parseFloat(r.hours_interval || 0);
    return (current - last) >= interval;
  }).length;

  const dueSoonCount = activeReminders.filter(r => {
    const isKm = r.reminder_type === 'km';
    const current = isKm
      ? (machineKm.find(h => h.machine_name === r.machine_name) ? parseFloat(machineKm.find(h => h.machine_name === r.machine_name).current_km || 0) : 0)
      : (machineHours.find(h => h.machine_name === r.machine_name) ? parseFloat(machineHours.find(h => h.machine_name === r.machine_name).current_hours || 0) : 0);
    const last = isKm ? parseFloat(r.last_service_km || 0) : parseFloat(r.last_service_hours || 0);
    const interval = isKm ? parseFloat(r.km_interval || 0) : parseFloat(r.hours_interval || 0);
    const used = current - last;
    const remaining = interval - used;
    const isOverdue = used >= interval;
    const isDueSoon = !isOverdue && remaining <= interval * 0.15;
    return isDueSoon;
  }).length;

  const subtitleStatus = overdueCount > 0 || dueSoonCount > 0
    ? `${overdueCount + dueSoonCount} reminder${overdueCount + dueSoonCount !== 1 ? 's' : ''} need attention`
    : 'All reminders clear';

  return (
    <div style={{
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
    }}>
      {/* Header row */}
      <div style={{
        padding: isDesktop ? '16px 20px' : '14px 16px',
        borderBottom: `0.5px solid ${currentTheme.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontSize: isDesktop ? '1.1rem' : '1rem', fontWeight: 'bold', color: currentTheme.text, margin: 0 }}>
            {greeting}, Dahlton Ag Ventures
          </p>
          <p style={{ fontSize: '0.75rem', color: currentTheme.textSecondary, margin: '2px 0 0' }}>
            {dateStr} · {subtitleStatus}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
          {overdueCount > 0 && (
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.3)' }}>
              {overdueCount} overdue
            </span>
          )}
          {dueSoonCount > 0 && (
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 'bold', border: '1px solid rgba(245,158,11,0.3)' }}>
              {dueSoonCount} due soon
            </span>
          )}
          {overdueCount === 0 && dueSoonCount === 0 && (
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)' }}>
              All clear
            </span>
          )}
        </div>
      </div>

      {/* Service + Calendar panels */}
      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 0 }}>
          <div style={{ borderRight: `0.5px solid ${currentTheme.cardBorder}` }}>
            <ServiceOverview
              serviceReminders={serviceReminders}
              machineHours={machineHours}
              machineKm={machineKm}
              theme={theme}
              isDesktop={isDesktop}
              onReminderClick={() => {
                setActiveTab('machinery');
                setShowRemindersPanel(true);
              }}
            />
          </div>
          <div>
      <FarmCalendar
              theme={theme}
              isDesktop={isDesktop}
              calendarNotes={calendarNotes}
              calendarSelectedKey={calendarSelectedKey}
              setCalendarSelectedKey={setCalendarSelectedKey}
              calendarNoteText={calendarNoteText}
              setCalendarNoteText={setCalendarNoteText}
              calendarNoteDirty={calendarNoteDirty}
              setCalendarNoteDirty={setCalendarNoteDirty}
              calendarSaving={calendarSaving}
              calendarSaved={calendarSaved}
              onSave={saveCalendarNote}
              userRole={userRole}
            />
          </div>
        </div>
      ) : (
<DashboardPanels
          theme={theme}
          isDesktop={isDesktop}
          serviceReminders={serviceReminders}
          machineHours={machineHours}
          machineKm={machineKm}
          onReminderClick={() => {
            setActiveTab('machinery');
            setShowRemindersPanel(true);
          }}
          calendarNotes={calendarNotes}
          calendarSelectedKey={calendarSelectedKey}
          setCalendarSelectedKey={setCalendarSelectedKey}
          calendarNoteText={calendarNoteText}
          setCalendarNoteText={setCalendarNoteText}
          calendarNoteDirty={calendarNoteDirty}
          setCalendarNoteDirty={setCalendarNoteDirty}
          calendarSaving={calendarSaving}
          calendarSaved={calendarSaved}
          onSave={saveCalendarNote}
          userRole={userRole}
        />
      )}
    </div>
  );
})()}
    
{/* Feature Cards 2x2 Grid */}
{(() => {
  const cards = [
    {
      id: 'general',
      icon: '👥',
      title: 'General features',
      iconBg: '#E1F5EE',
      badgeColor: '#0F6E56',
      badgeBg: '#E1F5EE',
      accentColor: '#1D9E75',
      badges: ['Real-time sync', 'Search & sort', 'Mobile friendly', 'Import/Export'],
      features: [
        { title: 'Real-time sync', desc: 'All changes sync instantly across every device — no manual refresh needed.' },
        { title: 'Search, sort & paginate', desc: 'Every tab has a search bar, sort options, and page size controls to quickly find any record.' },
        { title: 'Mobile friendly', desc: 'Fully responsive on phones, tablets, and desktop with layouts optimized for each.' },
        { title: 'Import & export', desc: 'Bulk import inventory, machinery, or service records via CSV. Export any dataset in one click from Settings.' },
        { title: 'Light & dark mode', desc: 'Switch between light and dark themes in Settings — your preference is saved per device.' },
      ]
    },
    {
      id: 'inventory',
      icon: '📦',
      title: 'Inventory',
      iconBg: '#E6F1FB',
      badgeColor: '#0C447C',
      badgeBg: '#E6F1FB',
      accentColor: '#378ADD',
      badges: ['Stock alerts', 'Quick qty', 'QR labels', 'Photos'],
      features: [
        { title: 'Add & edit items', desc: 'Create entries with photos, part numbers, quantities, and storage locations.' },
        { title: 'Stock alerts', desc: 'Items at or below minimum quantity show a red Low Stock badge. Overstocked items show in yellow.' },
        { title: 'Quick quantity updates', desc: 'Use the + and − buttons directly on any card for fast adjustments without opening an edit form.' },
        { title: 'QR code labels', desc: 'Generate and print a QR label for any item — scanning it opens that item directly in AgriTrack.' },
        { title: 'Photos', desc: 'Attach a photo to any inventory item and view it full-screen with zoom and pan.' },
      ]
    },
    {
      id: 'machinery',
      icon: '🚜',
      title: 'Machinery',
      iconBg: '#EAF3DE',
      badgeColor: '#27500A',
      badgeBg: '#EAF3DE',
      accentColor: '#639922',
      badges: ['Hours/km', 'Reminders', 'Categories', 'Photos'],
      features: [
        { title: 'Add & edit machines', desc: 'Register equipment with name, VIN/serial, license plate, category, requirements, and an optional photo.' },
        { title: 'Hours & kilometres', desc: 'Track running totals per machine — the correct metric is assigned automatically based on category.' },
        { title: 'Service reminders', desc: 'Set hour or km intervals for any task. Overdue machines get a red badge on their card automatically.' },
        { title: 'Category filters', desc: 'Toggle "Show Category Filters" to narrow the machinery list by equipment type instantly.' },
        { title: 'Service history link', desc: 'Each machine card shows its service record count — click it to jump straight to filtered records.' },
      ]
    },
    {
      id: 'service',
      icon: '🔧',
      title: 'Service history',
      iconBg: '#FAEEDA',
      badgeColor: '#633806',
      badgeBg: '#FAEEDA',
      accentColor: '#BA7517',
      badges: ['Log records', '10 photos', 'Filter by machine', 'Export'],
      features: [
        { title: 'Log services', desc: 'Search for a machine by name, category, or VIN — fill in service type, date, technician, and notes.' },
        { title: 'Up to 10 photos', desc: 'Attach up to 10 photos per record and browse them in the full-screen viewer with zoom and rotation.' },
        { title: 'Filter by machine', desc: 'Jump from the Machinery tab directly to a machine\'s filtered service records in one click.' },
        { title: 'Complete reminders', desc: 'Mark a service reminder as done directly from the record — resets the interval counter automatically.' },
        { title: 'Edit & export', desc: 'Edit or delete any record. Export full history to CSV via Settings — by date range or manual selection.' },
      ]
    },
  ];

  return (
    <div>
      {/* 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
        gap: isDesktop ? '12px' : '8px',
        marginBottom: '12px',
      }}>
        {cards.map(card => {
          const isActive = expandedCard === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setExpandedCard(isActive ? null : card.id)}
              style={{
                background: currentTheme.cardBackground,
                border: isActive ? `2px solid ${card.accentColor}` : `1px solid ${currentTheme.cardBorder}`,
                borderRadius: '10px',
                padding: isDesktop ? '16px' : '12px',
                cursor: 'pointer',
                opacity: expandedCard && !isActive ? 0.45 : 1,
                transition: 'opacity 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: isDesktop ? '32px' : '26px',
                    height: isDesktop ? '32px' : '26px',
                    borderRadius: '50%',
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isDesktop ? '16px' : '13px',
                    flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>
                  <span style={{
                    fontSize: isDesktop ? '14px' : '12px',
                    fontWeight: 'bold',
                    color: currentTheme.text,
                  }}>
                    {card.title}
                  </span>
                </div>
                {isActive && (
                  <span style={{ fontSize: '11px', color: card.accentColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    ▲ close
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {card.badges.map(badge => (
                  <span key={badge} style={{
                    fontSize: isDesktop ? '10px' : '9px',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    background: card.badgeBg,
                    color: card.badgeColor,
                    fontWeight: '500',
                  }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expandedCard && (() => {
        const card = cards.find(c => c.id === expandedCard);
        if (!card) return null;
        return (
          <div style={{
            background: currentTheme.cardBackground,
            border: `2px solid ${card.accentColor}`,
            borderRadius: '10px',
            padding: isDesktop ? '20px' : '14px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: isDesktop ? '15px' : '14px', fontWeight: 'bold', color: currentTheme.text, margin: 0 }}>
                  {card.title}
                </p>
                <p style={{ fontSize: '11px', color: currentTheme.textSecondary, margin: 0 }}>
                  Tap any card to collapse
                </p>
              </div>
            </div>
            {card.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderBottom: i < card.features.length - 1 ? `0.5px solid ${currentTheme.cardBorder}` : 'none',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: card.accentColor,
                  flexShrink: 0,
                  marginTop: '5px',
                }} />
                <div>
                  <p style={{ fontSize: isDesktop ? '13px' : '12px', fontWeight: 'bold', color: currentTheme.text, margin: '0 0 2px' }}>
                    {f.title}
                  </p>
                  <p style={{ fontSize: isDesktop ? '12px' : '11px', color: currentTheme.textSecondary, margin: 0, lineHeight: '1.5' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
})()}   
  </div>
)}
  
  {activeTab === 'inventory' && (
  <div>
{inventorySaveConfirmed && (
  <div style={{
    padding: '12px 18px',
    marginBottom: '16px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '2px solid #10b981',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#10b981',
    animation: 'floatIn 0.3s ease-out'
  }}>
    <span style={{ fontSize: '1.2rem' }}>✅</span>
    Item saved and confirmed in database
  </div>
)}
{exportMode === 'inventory' && (
      <div style={{
        padding: '14px 18px', marginBottom: '16px',
        background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
        borderRadius: '10px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.1rem' }}>☑</span>
          <span style={{ fontWeight: '700', color: '#10b981' }}>Export Mode</span>
          <span style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
            {exportInventorySelected.size} item{exportInventorySelected.size !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => {
            const visibleIds = new Set(getFilteredAndSortedInventory().map(i => i.id));
            setExportInventorySelected(prev => new Set([...prev, ...visibleIds]));
          }} style={{
            padding: '8px 14px', background: '#10b981', border: 'none',
            borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
          }}>
            Select All Visible
          </button>
          <button onClick={() => setExportInventorySelected(new Set())} style={{
            padding: '8px 14px', background: '#ef4444', border: 'none',
            borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
          }}>
            Clear All
          </button>
          <button onClick={() => { setActiveTab('settings'); setActiveSettingsSection('importexport'); }} style={{
            padding: '8px 14px', background: '#2563eb', border: 'none',
            borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
          }}>
            Done — Back to Settings
          </button>
        </div>
      </div>
    )}
    <div style={styles.tabHeader}>
      <h2 style={{ fontSize: '1.5rem' }}>Inventory Items</h2>
      {userRole !== 'employee' && (
<button 
  onClick={() => {
    setShowInventoryModal(true);
  }} 
  style={styles.addButton}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
    e.target.style.background = theme === 'light' ? '#4ade80' : '#059669';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.target.style.background = theme === 'light' ? '#86efac' : '#10b981';
  }}
>
  <Plus size={20} /> Add Item
</button>
      )}
    </div>

   <div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'nowrap',
  overflow: 'auto'
}}>
 <input
    type="text"
    placeholder="🔍 Search inventory (name, part number, location)..."
    value={inventorySearch}
    onChange={(e) => {
      setInventorySearch(e.target.value);
      setInventoryPage(1);
    }}
    style={styles.searchInput}
    autoCorrect="off"
    autoCapitalize="none"
    spellCheck={false}
  />
  <select
    value={inventorySort}
    onChange={(e) => {
      setInventorySort(e.target.value);
      setInventoryPage(1);
    }}
    style={{
      padding: '10px 12px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '180px',
      flexShrink: 0
    }}
  >
    <option value="name-asc">Name (A → Z)</option>
    <option value="name-desc">Name (Z → A)</option>
    <option value="recently-added">Recently Added</option>
    <option value="quantity-asc">Stock (Low → High)</option>
    <option value="quantity-desc">Stock (High → Low)</option>
    <option value="location">Location</option>
  </select>
  <select
    value={inventoryItemsPerPage}
    onChange={(e) => {
      setInventoryItemsPerPage(Number(e.target.value));
      setInventoryPage(1);
    }}
    style={{
      padding: '10px 12px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '100px',
      flexShrink: 0
    }}
  >
    <option value="25">Show 25</option>
    <option value="50">Show 50</option>
    <option value="100">Show 100</option>
    <option value="200">Show 200</option>
    <option value="500">Show 500</option>
    <option value="1000">Show 1000</option>
    <option value="2000">Show 2000</option>
    <option value="99999">Show All</option>
  </select>
</div>
    {inventory.length === 0 ? (
      <div style={styles.emptyState}>
        <Package size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
        <p>No inventory items yet</p>
      </div>
    ) : getFilteredAndSortedInventory().length === 0 ? (
      <div style={styles.emptyState}>
        <Package size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
        <p>No items match your search</p>
      </div>
    ) : (
      <>
        {/* TOP PAGINATION CONTROLS */}
        <div style={{
          padding: '16px',
          background: currentTheme.cardBackground,
          border: `1px solid ${currentTheme.cardBorder}`,
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ color: currentTheme.text }}>
            Showing <strong>{getPaginatedInventory().startIndex}-{getPaginatedInventory().endIndex}</strong> of <strong>{getPaginatedInventory().totalItems}</strong> items
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setInventoryPage(1)}
              disabled={inventoryPage === 1}
              style={{
                padding: '8px 16px',
                background: inventoryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                color: inventoryPage === 1 ? 'white' : (theme === 'light' ? '#14532d' : 'white'),
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: inventoryPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: inventoryPage === 1 ? 0.5 : 1
              }}
            >
              First
            </button>
            <button
              onClick={() => setInventoryPage(prev => Math.max(1, prev - 1))}
              disabled={inventoryPage === 1}
              style={{
                padding: '8px 16px',
                background: inventoryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: inventoryPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: inventoryPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ 
              padding: '8px 16px', 
              color: currentTheme.text,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              Page {inventoryPage} of {getPaginatedInventory().totalPages}
            </span>
            <button
              onClick={() => setInventoryPage(prev => Math.min(getPaginatedInventory().totalPages, prev + 1))}
              disabled={inventoryPage === getPaginatedInventory().totalPages}
              style={{
                padding: '8px 16px',
                background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: inventoryPage === getPaginatedInventory().totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: inventoryPage === getPaginatedInventory().totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
            <button
              onClick={() => setInventoryPage(getPaginatedInventory().totalPages)}
              disabled={inventoryPage === getPaginatedInventory().totalPages}
              style={{
                padding: '8px 16px',
                background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: inventoryPage === getPaginatedInventory().totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: inventoryPage === getPaginatedInventory().totalPages ? 0.5 : 1
              }}
            >
              Last
            </button>
          </div>
        </div>

        {/* INVENTORY ITEMS LIST */}
        <div style={styles.itemsList}>
          {getPaginatedInventory().items.map(item => (
<div key={item.id} id={`inventory-item-${item.id}`} className="item-card" style={{
                ...styles.itemCard,
                outline: exportMode === 'inventory' && exportInventorySelected.has(item.id)
                  ? '2px solid #10b981' : 'none'
              }}>
              {exportMode === 'inventory' && (
                <input
                  type="checkbox"
                  checked={exportInventorySelected.has(item.id)}
                  onChange={(e) => {
                    setExportInventorySelected(prev => {
                      const next = new Set(prev);
                      e.target.checked ? next.add(item.id) : next.delete(item.id);
                      return next;
                    });
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, accentColor: '#10b981' }}
                />
              )}
              {editingInventoryId === item.id ? (
                <div style={{ flex: 1 }}>
                  <input
                    style={styles.input}
                    placeholder="Item Name"
                    value={inventoryForm.name}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  />
                <input
              style={styles.input}
              placeholder="Part Number"
              value={inventoryForm.partNumber}
              onChange={(e) => setInventoryForm({ ...inventoryForm, partNumber: e.target.value })}
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
                />
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Quantity"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Location"
                    value={inventoryForm.location}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Min Quantity"
                      value={inventoryForm.minQuantity}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, minQuantity: e.target.value })}
                    />
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Max Quantity"
                      value={inventoryForm.maxQuantity}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, maxQuantity: e.target.value })}
                    />
                  </div>
                 <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
                      📸 Upload Photo
                    </label>
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoUrl = await handlePhotoUpload(file, 'inventory');
      if (photoUrl) {
        setInventoryForm({ ...inventoryForm, photoUrl });
      }
    }
    e.target.value = '';
  }}
  style={{ ...styles.input, padding: '8px' }}
/>
                    {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Compressing photo...</p>}
{inventoryForm.photoUrl && (
  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
    <img 
      src={inventoryForm.photoUrl} 
      alt="Preview" 
      style={{ maxWidth: '100px', borderRadius: '8px', display: 'block' }} 
    />
    <button
      onClick={(e) => {
        e.preventDefault();
        setInventoryForm({ ...inventoryForm, photoUrl: '' });
      }}
      style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: '#ef4444',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
      title="Remove photo"
    >
      ✕
    </button>
  </div>
)}
                  </div>
                 <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button 
  onClick={() => saveInventoryEdit(item.id)} 
  style={{
    ...styles.saveButton,
    opacity: savingInventory ? 0.7 : 1,
    cursor: savingInventory ? 'not-allowed' : 'pointer'
  }}
  disabled={savingInventory}
>
  {savingInventory ? (
    <>
      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> 
      Saving...
    </>
  ) : (
    <>
      <Save size={16} /> Save
    </>
  )}
</button>
                    <button onClick={cancelInventoryEdit} style={styles.cancelButton}>
                      <X size={16} /> Cancel
                    </button>
                    {inventorySaveConfirmed && (
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        animation: 'floatIn 0.3s ease-out'
                      }}>
                        ✅ Saved
                      </span>
                    )}
                    <button
                      onClick={() => printInventoryQR(item)}
                      style={{
                        padding: '10px 16px',
                        background: theme === 'light' ? '#bae6fd' : '#0891b2',
                        border: 'none',
                        borderRadius: '8px',
                        color: theme === 'light' ? '#0c4a6e' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      📷 Print QR
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', marginRight: '16px' }}>
                    {item.photoUrl && (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={item.photoUrl} 
                          alt={item.name} 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            border: '2px solid transparent',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            pointerEvents: 'auto',
                            display: 'block'
                          }}
                          onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  setViewingImage(item.photoUrl);
  setViewingImageArray([item.photoUrl]);
  setViewingImageIndex(0);
  setImageModalTitle(item.name);
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.05)';
  e.currentTarget.style.borderColor = '#10b981';
}}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                        />
                        {userRole !== 'employee' && (
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (confirm('Remove this photo from the inventory item?')) {
                                try {
                                  await supabase.from('inventory_items').update({
                                    photo_url: ''
                                  }).eq('id', item.id);
                                  
                                  setInventory(prev => prev.map(i => 
                                    i.id === item.id ? { ...i, photoUrl: '' } : i
                                  ));
                                  
                                  console.log('✅ Photo removed from inventory');
                                } catch (error) {
                                  console.error('Error removing photo:', error);
                                  alert('Failed to remove photo');
                                }
                              }
                            }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                              zIndex: 10
                            }}
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}
                    {!isDesktop && userRole !== 'employee' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
                       <div
                        onClick={() => printInventoryQR(item)}
                        title="Print QR Label"
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {qrLibLoaded ? (
                          <img
                            src={generateQRDataUrl(item)}
                            alt="QR Code"
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '6px',
                              border: `2px solid ${theme === 'light' ? '#bae6fd' : '#0891b2'}`,
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            border: `2px solid ${theme === 'light' ? '#bae6fd' : '#0891b2'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            background: theme === 'light' ? '#f0f9ff' : '#0c4a6e',
                          }}>
                            ▦
                          </div>
                        )}
                        <span style={{
                          fontSize: '0.6rem',
                          color: theme === 'light' ? '#0891b2' : '#7dd3fc',
                          fontWeight: '600',
                        }}>
                          Print QR
                        </span>
                      </div>
                      <button onClick={() => startEditInventory(item)} style={styles.editButton}>
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteInventoryItem(item.id);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteInventoryItem(item.id);
                          }}
                          style={{...styles.deleteButton, touchAction: 'manipulation'}}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                 <div style={{ flex: 1 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <h3 style={{ fontSize: '1rem', wordBreak: 'break-word' }}>{item.name}</h3>
                    {getStockStatus(item) === 'low' && (
  <span className="stock-badge-low" style={styles.stockBadgeLow}>⚠️ Low Stock</span>
)}
                      {getStockStatus(item) === 'high' && (
                        <span style={styles.stockBadgeHigh}>⚠️ Overstocked</span>
                      )}
                    </div>
                    <div style={{ ...styles.itemDetails, gridTemplateColumns: isDesktop ? 'repeat(4, minmax(120px, 1fr))' : 'repeat(2, 1fr)' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Part Number</p>
                        <p>{item.partNumber || 'N/A'}</p>
                      </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Quantity</p>
                        {userRole === 'employee' ? (
                          <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.quantity || 0}</p>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
<button 
  onClick={(e) => { e.stopPropagation(); quickUpdateQuantity(item.id, -1); }}
  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); quickUpdateQuantity(item.id, -1); }}
  style={{ ...styles.quantityButton, touchAction: 'manipulation' }}
>
  −
</button>
<p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.quantity || 0}</p>
<button 
  onClick={(e) => { e.stopPropagation(); quickUpdateQuantity(item.id, 1); }}
  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); quickUpdateQuantity(item.id, 1); }}
  style={{ ...styles.quantityButton, touchAction: 'manipulation' }}
>
  +
</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Location</p>
                        <p>{item.location || 'N/A'}</p>
                      </div>
                      {(item.minQuantity || item.maxQuantity) && (
                        <div>
                          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Min / Max</p>
                          <p>{item.minQuantity || '—'} / {item.maxQuantity || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {isDesktop && userRole !== 'employee' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div
                          onClick={() => printInventoryQR(item)}
                          title="Print QR Label"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                        {qrLibLoaded ? (
                          <img
                            src={generateQRDataUrl(item)}
                            alt="QR Code"
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '6px',
                              border: `2px solid ${theme === 'light' ? '#bae6fd' : '#0891b2'}`,
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '6px',
                            border: `2px solid ${theme === 'light' ? '#bae6fd' : '#0891b2'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            background: theme === 'light' ? '#f0f9ff' : '#0c4a6e',
                          }}>
                            ▦
                          </div>
                        )}
                          <span style={{
                            fontSize: '0.6rem',
                            color: theme === 'light' ? '#0891b2' : '#7dd3fc',
                            fontWeight: '600',
                          }}>
                            Print QR
                          </span>
                        </div>
                        <button onClick={() => startEditInventory(item)} style={styles.editButton}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteInventoryItem(item.id);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteInventoryItem(item.id);
                        }}
                        style={{...styles.deleteButton, touchAction: 'manipulation'}}
                      >
                        <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM PAGINATION CONTROLS */}
        <div style={{
          padding: '16px',
          background: currentTheme.cardBackground,
          border: `1px solid ${currentTheme.cardBorder}`,
          borderRadius: '12px',
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setInventoryPage(1)}
            disabled={inventoryPage === 1}
            style={{
              padding: '8px 16px',
              background: inventoryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: inventoryPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: inventoryPage === 1 ? 0.5 : 1
            }}
          >
            First
          </button>
          <button
            onClick={() => setInventoryPage(prev => Math.max(1, prev - 1))}
            disabled={inventoryPage === 1}
            style={{
              padding: '8px 16px',
              background: inventoryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: inventoryPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: inventoryPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{ 
            padding: '8px 16px', 
            color: currentTheme.text,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            Page {inventoryPage} of {getPaginatedInventory().totalPages}
          </span>
          <button
            onClick={() => setInventoryPage(prev => Math.min(getPaginatedInventory().totalPages, prev + 1))}
            disabled={inventoryPage === getPaginatedInventory().totalPages}
            style={{
              padding: '8px 16px',
              background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: inventoryPage === getPaginatedInventory().totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: inventoryPage === getPaginatedInventory().totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
          <button
            onClick={() => setInventoryPage(getPaginatedInventory().totalPages)}
            disabled={inventoryPage === getPaginatedInventory().totalPages}
            style={{
              padding: '8px 16px',
              background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: inventoryPage === getPaginatedInventory().totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: inventoryPage === getPaginatedInventory().totalPages ? 0.5 : 1
            }}
          >
            Last
          </button>
        </div>
      </>
    )}
  </div>
)}

        {activeTab === 'machinery' && (
          <div>
{exportMode === 'machinery' && (
  <div style={{
    padding: '14px 18px', marginBottom: '16px',
    background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
    borderRadius: '10px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '1.1rem' }}>☑</span>
      <span style={{ fontWeight: '700', color: '#10b981' }}>Export Mode</span>
      <span style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
        {exportMachinerySelected.size} item{exportMachinerySelected.size !== 1 ? 's' : ''} selected
      </span>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button onClick={() => {
        const visibleIds = new Set(getFilteredAndSortedMachinery().map(i => i.id));
        setExportMachinerySelected(prev => new Set([...prev, ...visibleIds]));
      }} style={{
        padding: '8px 14px', background: '#10b981', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
      }}>
        Select All Visible
      </button>
      <button onClick={() => setExportMachinerySelected(new Set())} style={{
        padding: '8px 14px', background: '#ef4444', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
      }}>
        Clear All
      </button>
      <button onClick={() => { setActiveTab('settings'); setActiveSettingsSection('importexport'); }} style={{
        padding: '8px 14px', background: '#2563eb', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
      }}>
        Done — Back to Settings
      </button>
    </div>
  </div>
)}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '12px'
}}>
  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Machinery</h2>
  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
<button
  onClick={() => setShowRemindersPanel(!showRemindersPanel)}
  style={{
    padding: '10px 16px',
    background: theme === 'light' ? '#86efac' : '#10b981',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: theme === 'light' ? '#14532d' : 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
    e.currentTarget.style.background = theme === 'light' ? '#4ade80' : '#059669';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.currentTarget.style.background = theme === 'light' ? '#86efac' : '#10b981';
  }}
>
  <Wrench size={16} /> {showRemindersPanel ? 'Hide' : (isDesktop ? 'Show Service Reminders' : 'Show')}
</button>
    {userRole !== 'employee' && (
<button 
  onClick={() => {
    setShowMachineryModal(true);
  }} 
  style={{
    padding: '10px 16px',
    background: theme === 'light' ? '#86efac' : '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: theme === 'light' ? '#14532d' : 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
    e.currentTarget.style.background = theme === 'light' ? '#4ade80' : '#059669';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.currentTarget.style.background = theme === 'light' ? '#86efac' : '#10b981';
  }}
>
  <Plus size={16} /> {isDesktop ? 'Add Machinery' : 'Add'}
</button>
    )}
  </div>
</div>

<div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'nowrap',
  overflow: 'auto'
}}>
  <input
    type="text"
    placeholder="🔍 Search machinery (name, VIN/serial, category)..."
    value={machinerySearch}
    onChange={(e) => {
      setMachinerySearch(e.target.value);
      setMachineryPage(1);
    }}
    style={styles.searchInput}
    autoCorrect="off"
    autoCapitalize="none"
    spellCheck={false}
  />
<select
  value={machinerySort}
  onChange={(e) => {
    setMachinerySort(e.target.value);
    setMachineryPage(1);
  }}
  style={{
    padding: '10px 12px',
    background: currentTheme.inputBackground,
    border: `1px solid ${currentTheme.cardBorder}`,
    borderRadius: '8px',
    color: currentTheme.text,
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '140px',
    flexShrink: 0
  }}
>
  <option value="name-asc">Name (A → Z)</option>
  <option value="name-desc">Name (Z → A)</option>
  <option value="category">Category</option>
</select>
 <select
  value={machineryItemsPerPage}
  onChange={(e) => {
    setMachineryItemsPerPage(Number(e.target.value));
    setMachineryPage(1);
  }}
  style={{
    padding: '10px 12px',
    background: currentTheme.inputBackground,
    border: `1px solid ${currentTheme.cardBorder}`,
    borderRadius: '8px',
    color: currentTheme.text,
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '100px',
    flexShrink: 0
  }}
>
  <option value="25">Show 25</option>
  <option value="50">Show 50</option>
  <option value="100">Show 100</option>
  <option value="200">Show 200</option>
  <option value="500">Show 500</option>
  <option value="1000">Show 1000</option>
  <option value="2000">Show 2000</option>
  <option value="99999">Show All</option>
</select>
</div>
            
{/* Toggle Category Filter Button */}
<button
  onClick={() => setShowCategoryTabs(!showCategoryTabs)}
  style={{
    padding: '10px 20px',
    background: showCategoryTabs ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive,
    border: showCategoryTabs ? '2px solid #10b981' : `1px solid ${currentTheme.cardBorder}`,
    borderRadius: '8px',
    color: currentTheme.text,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: showCategoryTabs ? 'bold' : 'normal',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}
>
  {showCategoryTabs ? '👁️ Hide' : '👁️ Show'} Category Filters
</button>
            
{/* Category Filter Tabs */}
{showCategoryTabs && (
<div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'wrap',
  padding: '12px',
  background: currentTheme.cardBackground,
  border: `1px solid ${currentTheme.cardBorder}`,
  borderRadius: '12px'
}}>
  <button
    onClick={() => setMachinerySearch('')}
    style={{
      padding: '8px 16px',
      background: machinerySearch === '' ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive,
      border: machinerySearch === '' ? '2px solid #10b981' : `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: machinerySearch === '' ? 'bold' : 'normal'
    }}
  >
    All Machines ({machinery.length})
  </button>
  
  {(() => {
    // Get unique categories
    const categories = [...new Set(machinery.map(m => m.category).filter(c => c))].sort();
    
    return categories.map(category => {
      const count = machinery.filter(m => m.category === category).length;
      const isActive = machinerySearch.toLowerCase() === category.toLowerCase();
      
      return (
        <button
          key={category}
          onClick={() => setMachinerySearch(category)}
          style={{
            padding: '8px 16px',
            background: isActive ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive,
            border: isActive ? '2px solid #10b981' : `1px solid ${currentTheme.cardBorder}`,
            borderRadius: '8px',
            color: currentTheme.text,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: isActive ? 'bold' : 'normal'
          }}
        >
          {category} ({count})
        </button>
      );
    });
  })()}
</div>
)}
            
{/* REMINDERS PANEL - Shows when button is clicked */}
{showRemindersPanel && (
  <div style={{
background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#ffffff',
border: theme === 'dark' ? '2px solid #8b5cf6' : '2px solid #bfdbfe',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.5rem', color: theme === 'light' ? '#111827' : '#a78bfa', margin: 0 }}>⏰ Service Reminders</h3>
        <button
          onClick={loadDeletedReminders}
          style={{
            padding: '6px 14px',
            background: theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold'
          }}
        >
          <Trash2 size={14} /> View Deleted
        </button>
      </div>
      {userRole !== 'employee' && (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    {getFilteredAndSortedMachinery().some(m => { const t = getTrackingType(m); return t === 'hours' || t === 'both'; }) && (
      <button
        onClick={() => setShowReminderModal(true)}
        style={{
          padding: '10px 20px',
          background: '#10b981',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#059669'}
        onMouseLeave={(e) => e.target.style.background = '#10b981'}
      >
        <Plus size={16} /> Create Hour Reminder
      </button>
    )}
    {getFilteredAndSortedMachinery().some(m => { const t = getTrackingType(m); return t === 'km' || t === 'both'; }) && (
      <button
        onClick={() => setShowKmReminderModal(true)}
        style={{
          padding: '10px 20px',
          background: '#0891b2',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#0e7490'}
        onMouseLeave={(e) => e.target.style.background = '#0891b2'}
      >
        <Plus size={16} /> Create km Reminder
      </button>
    )}
  </div>
)}
    </div>

{/* === HOURS BANNER CARD === */}
{(() => {
  const hoursMachines = getFilteredAndSortedMachinery().filter(m => {
    const t = getTrackingType(m);
    return t === 'hours' || t === 'both';
  });
  if (hoursMachines.length === 0) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        onClick={() => setHoursExpanded(prev => !prev)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: hoursExpanded
            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)',
          border: '2px solid #10b981',
          borderRadius: hoursExpanded ? '12px 12px 0 0' : '12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '2rem' }}>⏱️</span>
          <div>
            <p style={{
  color: theme === 'light' ? '#111827' : 'white',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  margin: 0,
  textShadow: theme === 'light' ? 'none' : '0 1px 3px rgba(0,0,0,0.3)'
}}>
  Hour-Tracked Machines
</p>
<p style={{
  color: theme === 'light' ? '#374151' : 'rgba(255,255,255,0.8)',
  fontSize: '0.85rem',
  margin: '4px 0 0',
}}>
              {hoursMachines.length} machine{hoursMachines.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              {hoursMachines.filter(m => {
                const hrs = getMachineHours(m.name);
                return getMachineReminders(m.name).some(r => isReminderDue(r, hrs));
              }).length} with service due
            </p>
          </div>
        </div>
       <span style={{
  color: theme === 'light' ? '#111827' : 'white',
  fontSize: '1.5rem',
  transition: 'transform 0.3s ease',
  transform: hoursExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  display: 'inline-block'
}}>▼</span>
      </button>

      {hoursExpanded && (
        <div style={{
          background: theme === 'dark' ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
          border: '2px solid #10b981',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {hoursMachines.map(machine => {
            const hours = getMachineHours(machine.name);
            const reminders = getMachineReminders(machine.name);
            const dueCount = reminders.filter(r => isReminderDue(r, hours)).length;
            return (
              <div
                key={machine.id}
                onClick={() => openHoursDetail(machine)}
                style={{
                  background: dueCount > 0
                    ? 'rgba(239, 68, 68, 0.12)'
                    : (theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'white'),
                  border: dueCount > 0 ? '2px solid #ef4444' : '2px solid #10b981',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  marginBottom: '8px',
                  color: theme === 'dark' ? 'white' : '#111827',
                  wordBreak: 'break-word'
                }}>
                  {machine.name}
                </p>
                <p style={{
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  color: '#10b981',
                  margin: '4px 0'
                }}>
                  {hours.toFixed(1)} hrs
                </p>
                {dueCount > 0 && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>
                    ⚠️ {dueCount} service{dueCount > 1 ? 's' : ''} due
                  </p>
                )}
                {reminders.length > 0 && dueCount === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>
                    ✓ {reminders.length} reminder{reminders.length > 1 ? 's' : ''} active
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '6px' }}>
                  Tap to edit
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
})()}

{/* === KM BANNER CARD === */}
{(() => {
  const kmMachines = getFilteredAndSortedMachinery().filter(m => {
    const t = getTrackingType(m);
    return t === 'km' || t === 'both';
  });
  if (kmMachines.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <button
        onClick={() => setKmExpanded(prev => !prev)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: kmExpanded
            ? 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)'
            : 'linear-gradient(135deg, rgba(8, 145, 178, 0.25) 0%, rgba(14, 116, 144, 0.25) 100%)',
          border: '2px solid #0891b2',
          borderRadius: kmExpanded ? '12px 12px 0 0' : '12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '2rem' }}>🛣️</span>
          <div>
            <p style={{
  color: theme === 'light' ? '#111827' : 'white',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  margin: 0,
  textShadow: theme === 'light' ? 'none' : '0 1px 3px rgba(0,0,0,0.3)'
}}>
  Kilometre-Tracked Machines
</p>
<p style={{
  color: theme === 'light' ? '#374151' : 'rgba(255,255,255,0.8)',
  fontSize: '0.85rem',
  margin: '4px 0 0',
}}>
              {kmMachines.length} machine{kmMachines.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              {kmMachines.filter(m => {
                const km = getMachineKm(m.name);
                return getMachineKmReminders(m.name).some(r => isKmReminderDue(r, km));
              }).length} with service due
            </p>
          </div>
        </div>
<span style={{
  color: theme === 'light' ? '#111827' : 'white',
  fontSize: '1.5rem',
  transition: 'transform 0.3s ease',
  transform: kmExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  display: 'inline-block'
}}>▼</span>
      </button>

      {kmExpanded && (
        <div style={{
          background: theme === 'dark' ? 'rgba(8, 145, 178, 0.08)' : '#ecfeff',
          border: '2px solid #0891b2',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {kmMachines.map(machine => {
            const km = getMachineKm(machine.name);
            const kmReminders = getMachineKmReminders(machine.name);
            const dueCount = kmReminders.filter(r => isKmReminderDue(r, km)).length;
            return (
              <div
                key={machine.id}
                onClick={() => openKmDetail(machine)}
                style={{
                  background: dueCount > 0
                    ? 'rgba(239, 68, 68, 0.12)'
                    : (theme === 'dark' ? 'rgba(8, 145, 178, 0.15)' : 'white'),
                  border: dueCount > 0 ? '2px solid #ef4444' : '2px solid #0891b2',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  marginBottom: '8px',
                  color: theme === 'dark' ? 'white' : '#111827',
                  wordBreak: 'break-word'
                }}>
                  {machine.name}
                </p>
                <p style={{
                  fontSize: '1.6rem',
                  fontWeight: 'bold',
                  color: '#0891b2',
                  margin: '4px 0'
                }}>
                  {km.toFixed(1)} km
                </p>
                {dueCount > 0 && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>
                    ⚠️ {dueCount} service{dueCount > 1 ? 's' : ''} due
                  </p>
                )}
                {kmReminders.length > 0 && dueCount === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>
                    ✓ {kmReminders.length} reminder{kmReminders.length > 1 ? 's' : ''} active
                  </p>
                )}
                <p style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '6px' }}>
                  Tap to edit
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
})()}

    {/* Active Reminders */}
{(() => {
        const hoursOnlyMachines = getFilteredAndSortedMachinery().filter(m => {
          const t = getTrackingType(m);
          return t === 'hours' || t === 'both';
        });
        if (hoursOnlyMachines.length === 0) return null;
        const hoursOnlyMachineNames = hoursOnlyMachines.map(m => m.name);
        const allFiltered = serviceReminders.filter(r =>
          hoursOnlyMachineNames.includes(r.machine_name) && r.reminder_type !== 'km' && !r.deleted_at
        );
        const filteredReminders = [
          ...allFiltered.filter(r => !r.completed_at),
          ...allFiltered.filter(r => r.completed_at)
        ];
       if (filteredReminders.length === 0) {
          return (
            <>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active Hour Reminders</h4>
              <div style={styles.emptyState}>
                <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p>{serviceReminders.filter(r => r.reminder_type !== 'km').length === 0 ? 'No hour reminders set' : 'No reminders match your search'}</p>
              </div>
            </>
          );
        }
        
return (
          <>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active Hour Reminders</h4>
          <div style={styles.itemsList}>
            {filteredReminders.map(reminder => {
              const currentHours = getMachineHours(reminder.machine_name);
              const hoursSinceService = currentHours - (parseFloat(reminder.last_service_hours) || 0);
              const interval = parseFloat(reminder.hours_interval) || 0;
              const isDue = hoursSinceService >= interval;
              const hoursUntilDue = Math.max(0, interval - hoursSinceService);
              
              return (
<div key={reminder.id} style={{
          ...styles.itemCard,
          background: reminder.completed_at ? (theme === 'light' ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)') : isDue ? (theme === 'light' ? '#ffffff' : 'rgba(239, 68, 68, 0.1)') : (theme === 'light' ? '#eff6ff' : currentTheme.cardBackground),
          border: reminder.completed_at ? '2px solid #10b981' : isDue ? '1px solid #fca5a5' : (theme === 'light' ? '1px solid #bfdbfe' : `1px solid ${currentTheme.cardBorder}`),
          borderLeft: isDue && !reminder.completed_at ? '5px solid #ef4444' : undefined,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {reminder.completed_at && (
            <div style={{
position: 'absolute',
top: '12px',
left: '50%',
transform: 'translateX(-50%)',
padding: '8px 20px',
background: 'linear-gradient(to right, #10b981, #06b6d4)',
borderRadius: '20px',
fontSize: '1rem',
fontWeight: 'bold',
color: 'white',
zIndex: 2,
whiteSpace: 'nowrap'
            }}>
              ✅ Completed at {parseFloat(reminder.completed_at_metric || 0).toFixed(1)} hrs
            </div>
          )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{reminder.machine_name}</h4>
                      {isDue && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #ef4444',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          color: '#ef4444',
                          fontWeight: 'bold'
                        }}>
                          ⚠️ DUE NOW
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '1rem', color: '#06b6d4', marginBottom: '12px' }}>
                      {reminder.reminder_name}
                    </p>
                    <div style={styles.itemDetails}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Current Hours</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{currentHours.toFixed(1)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Service Interval</p>
                        <p>Every {interval} hours</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Last Service</p>
                        <p>{parseFloat(reminder.last_service_hours || 0).toFixed(1)} hrs</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          {isDue ? 'Hours Overdue' : 'Hours Until Due'}
                        </p>
                        <p style={{ 
                          fontWeight: 'bold',
                          color: isDue ? '#ef4444' : '#10b981'
                        }}>
                          {isDue ? hoursSinceService.toFixed(1) : hoursUntilDue.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {userRole !== 'employee' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
{!reminder.completed_at && (
  <button
    onClick={() => completeReminder(reminder.id)}
    style={{
      ...styles.saveButton,
      background: '#10b981'
    }}
  >
    ✓ Complete
  </button>
)}
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
           </div>
          </>
        );
      })()}

{/* Active km Reminders */}
{(() => {
  const kmOnlyMachines = getFilteredAndSortedMachinery().filter(m => {
    const t = getTrackingType(m);
    return t === 'km' || t === 'both';
  });
  if (kmOnlyMachines.length === 0) return null;
  return (
<div style={{ marginTop: '24px' }}>
  <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active km Reminders</h4>
  {(() => {
    const filteredMachineNames = kmOnlyMachines.map(m => m.name);
const allKmFiltered = serviceReminders.filter(r =>
      filteredMachineNames.includes(r.machine_name) && r.reminder_type === 'km' && !r.deleted_at
    );
    const filteredKmReminders = [
      ...allKmFiltered.filter(r => !r.completed_at),
      ...allKmFiltered.filter(r => r.completed_at)
    ];
    if (filteredKmReminders.length === 0) {
      return (
        <div style={styles.emptyState}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
          <p>No km reminders set</p>
        </div>
      );
    }
    return (
      <div style={styles.itemsList}>
        {filteredKmReminders.map(reminder => {
          const currentKm = getMachineKm(reminder.machine_name);
          const kmSinceService = currentKm - (parseFloat(reminder.last_service_km) || 0);
          const interval = parseFloat(reminder.km_interval) || 0;
          const isDue = kmSinceService >= interval;
          const kmUntilDue = Math.max(0, interval - kmSinceService);
          return (
<div key={reminder.id} style={{
              ...styles.itemCard,
              background: reminder.completed_at ? (theme === 'light' ? '#ecfeff' : 'rgba(8, 145, 178, 0.08)') : isDue ? (theme === 'light' ? '#ffffff' : 'rgba(239, 68, 68, 0.1)') : (theme === 'light' ? '#ecfeff' : currentTheme.cardBackground),
              border: reminder.completed_at ? '2px solid #0891b2' : isDue ? '1px solid #fca5a5' : (theme === 'light' ? '1px solid #a5f3fc' : '1px solid #0891b2'),
              borderLeft: isDue && !reminder.completed_at ? '5px solid #ef4444' : undefined,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {reminder.completed_at && (
                <div style={{
position: 'absolute',
top: '12px',
left: '50%',
transform: 'translateX(-50%)',
padding: '8px 20px',
background: 'linear-gradient(to right, #10b981, #06b6d4)',
borderRadius: '20px',
fontSize: '1rem',
fontWeight: 'bold',
color: 'white',
zIndex: 2,
whiteSpace: 'nowrap'
                }}>
                  ✅ Completed at {parseFloat(reminder.completed_at_metric || 0).toFixed(1)} km
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{reminder.machine_name}</h4>
                  {isDue && (
                    <span style={{
                      padding: '4px 12px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ DUE NOW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '1rem', color: '#0891b2', marginBottom: '12px' }}>
                  {reminder.reminder_name}
                </p>
                <div style={styles.itemDetails}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Current km</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{currentKm.toFixed(1)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Service Interval</p>
                    <p>Every {interval} km</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Last Service</p>
                    <p>{parseFloat(reminder.last_service_km || 0).toFixed(1)} km</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {isDue ? 'km Overdue' : 'km Until Due'}
                    </p>
                    <p style={{ fontWeight: 'bold', color: isDue ? '#ef4444' : '#0891b2' }}>
                      {isDue ? kmSinceService.toFixed(1) : kmUntilDue.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              {userRole !== 'employee' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
{!reminder.completed_at && (
  <button
    onClick={() => completeKmReminder(reminder.id)}
    style={{
      ...styles.saveButton,
      background: '#0891b2'
    }}
  >
    ✓ Complete
  </button>
)}
                  <button
                      onClick={() => deleteReminder(reminder.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  })()}
</div>
  );
})()}
  </div>
)}

{/* Only show machinery list when reminders panel is hidden */}
{!showRemindersPanel && (
  <>
     {machinery.length === 0 ? (
  <div style={styles.emptyState}>
    <Truck size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
    <p>No machinery yet</p>
  </div>
) : getPaginatedMachinery().totalItems === 0 ? (
  <div style={styles.emptyState}>
    <Truck size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
    <p>No machines match your search</p>
  </div>
) : (
  <>
    {/* TOP PAGINATION CONTROLS */}
    <div style={{
      padding: '16px',
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ color: currentTheme.text }}>
        Showing <strong>{getPaginatedMachinery().startIndex}-{getPaginatedMachinery().endIndex}</strong> of <strong>{getPaginatedMachinery().totalItems}</strong> machines
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMachineryPage(1)}
          disabled={machineryPage === 1}
          style={{
            padding: '8px 16px',
            background: machineryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: machineryPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: machineryPage === 1 ? 0.5 : 1
          }}
        >
          First
        </button>
        <button
          onClick={() => setMachineryPage(prev => Math.max(1, prev - 1))}
          disabled={machineryPage === 1}
          style={{
            padding: '8px 16px',
            background: machineryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: machineryPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: machineryPage === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        <span style={{ 
          padding: '8px 16px', 
          color: currentTheme.text,
          fontSize: '0.875rem',
          fontWeight: 'bold'
        }}>
          Page {machineryPage} of {getPaginatedMachinery().totalPages}
        </span>
        <button
          onClick={() => setMachineryPage(prev => Math.min(getPaginatedMachinery().totalPages, prev + 1))}
          disabled={machineryPage === getPaginatedMachinery().totalPages}
          style={{
            padding: '8px 16px',
            background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: machineryPage === getPaginatedMachinery().totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: machineryPage === getPaginatedMachinery().totalPages ? 0.5 : 1
          }}
        >
          Next
        </button>
        <button
          onClick={() => setMachineryPage(getPaginatedMachinery().totalPages)}
          disabled={machineryPage === getPaginatedMachinery().totalPages}
          style={{
            padding: '8px 16px',
            background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: machineryPage === getPaginatedMachinery().totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: machineryPage === getPaginatedMachinery().totalPages ? 0.5 : 1
          }}
        >
          Last
        </button>
      </div>
    </div>

    {/* MACHINERY ITEMS LIST */}
    <div style={styles.itemsList}>
      {getPaginatedMachinery().items.map(item => (
<div key={item.id} className="item-card" style={{
          ...styles.itemCard,
          outline: exportMode === 'machinery' && exportMachinerySelected.has(item.id)
            ? '2px solid #10b981' : 'none'
        }}>
        {exportMode === 'machinery' && (
          <input
            type="checkbox"
            checked={exportMachinerySelected.has(item.id)}
            onChange={(e) => {
              setExportMachinerySelected(prev => {
                const next = new Set(prev);
                e.target.checked ? next.add(item.id) : next.delete(item.id);
                return next;
              });
            }}
            style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, accentColor: '#10b981' }}
          />
        )}
          {editingMachineryId === item.id ? (
            <div style={{ flex: 1 }}>
              <input
  style={styles.input}
  placeholder="Machine Name"
  value={machineryForm.name}
  onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
/>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
  <input
    style={styles.input}
    placeholder="VIN / Serial Number"
    value={machineryForm.vinSerial}
    onChange={(e) => setMachineryForm({ ...machineryForm, vinSerial: e.target.value })}
  />
  <input
    style={styles.input}
    placeholder="License Plate"
    value={machineryForm.licensePlate}
    onChange={(e) => setMachineryForm({ ...machineryForm, licensePlate: e.target.value })}
  />
</div>
<select
  style={{...styles.input, position: 'relative', zIndex: 9999}}
  value={machineryForm.category}
  onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
>
  <option value="">Select Category...</option>
  <option value="Attachments">Attachments</option>
  <option value="Augers and Conveyors">Augers and Conveyors</option>
  <option value="Bikes and Small Motors">Bikes and Small Motors</option>
  <option value="Bulldozer Blades">Bulldozer Blades</option>
  <option value="Cars and Trucks">Cars and Trucks</option>
  <option value="Combines">Combines</option>
  <option value="Dryers">Dryers</option>
  <option value="Grain Handling">Grain Handling</option>
  <option value="Harvest Equipment">Harvest Equipment</option>
  <option value="Heavy Trucks">Heavy Trucks</option>
  <option value="Land Improvement Equipment">Land Improvement Equipment</option>
  <option value="Landscape Equipment">Landscape Equipment</option>
  <option value="Lifts &amp; Cranes">Lifts &amp; Cranes</option>
  <option value="Other">Other</option>
  <option value="Spreaders">Spreaders</option>
  <option value="Spraying">Spraying</option>
  <option value="Straight Cut/Pick-Up Headers">Straight Cut/Pick-Up Headers</option>
  <option value="Tillage and Seeding">Tillage and Seeding</option>
  <option value="Tractors">Tractors</option>
  <option value="Trailers">Trailers</option>
</select>
<select
  style={{...styles.input, position: 'relative', zIndex: 9998}}
  value={machineryForm.tracking_type || ''}
  onChange={(e) => setMachineryForm({ ...machineryForm, tracking_type: e.target.value })}
>
  <option value="">Tracking type — use category default</option>
  <option value="hours">Hours</option>
  <option value="km">km</option>
  <option value="none">None</option>
</select>
              
              <textarea
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical', fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', fontSize: '1rem' }}
                placeholder="Machine Requirements (e.g., oil type, tire pressure, fluid specs...)"
                value={machineryForm.requirements}
                onChange={(e) => setMachineryForm({ ...machineryForm, requirements: e.target.value })}
              />
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
                  📸 Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const photoUrl = await handlePhotoUpload(file, 'machinery');
                      if (photoUrl) {
                        setMachineryForm({ ...machineryForm, photoUrl });
                      }
                    }
                    e.target.value = '';
                  }}
                  style={{ ...styles.input, padding: '8px' }}
                />
                {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
{machineryForm.photoUrl && (
  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
    <img 
      src={machineryForm.photoUrl} 
      alt="Preview" 
      style={{ maxWidth: '100px', borderRadius: '8px', display: 'block' }} 
    />
    <button
      onClick={() => setMachineryForm({ ...machineryForm, photoUrl: '' })}
      style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: '#ef4444',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
      title="Remove photo"
    >
      ✕
    </button>
  </div>
)}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button 
  onClick={() => saveMachineryEdit(item.id)} 
  style={{
    ...styles.saveButton,
    opacity: savingMachinery ? 0.7 : 1,
    cursor: savingMachinery ? 'not-allowed' : 'pointer'
  }}
  disabled={savingMachinery}
>
  {savingMachinery ? (
    <>
      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> 
      Saving...
    </>
  ) : (
    <>
      <Save size={16} /> Save
    </>
  )}
</button>
                <button onClick={cancelMachineryEdit} style={styles.cancelButton}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '16px' }}>
                {item.photoUrl && (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={item.photoUrl} 
                      alt={item.name} 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        border: '2px solid transparent',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'auto',
                        display: 'block'
                      }}
                     onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  setViewingImage(item.photoUrl);
  setViewingImageArray([item.photoUrl]);
  setViewingImageIndex(0);
  setImageModalTitle(item.name);
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'scale(1.05)';
  e.currentTarget.style.borderColor = '#10b981';
}}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    />
                    {userRole !== 'employee' && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm('Remove this photo from the machine?')) {
                            try {
                              await supabase.from('machinery_items').update({
                                photo_url: ''
                              }).eq('id', item.id);
                              
                              setMachinery(prev => prev.map(i => 
                                i.id === item.id ? { ...i, photoUrl: '' } : i
                              ));
                              
                              console.log('✅ Photo removed from machinery');
                            } catch (error) {
                              console.error('Error removing photo:', error);
                              alert('Failed to remove photo');
                            }
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          zIndex: 10
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
               {!isDesktop && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
  onClick={() => viewMachineServiceHistory(item.name)} 
  style={{
    ...styles.editButton,
    background: theme === 'dark' ? '#8b5cf6' : '#bae6fd',
    color: theme === 'dark' ? 'white' : '#0c4a6e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    whiteSpace: 'nowrap'
  }}
  title="View service history for this machine"
>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: '0.875rem' }}>
                        {serviceHistory.filter(r => r.machineName === item.name).length} Services
                      </span>
                    </button>
                    {userRole !== 'employee' && (
                      <>
                        <button onClick={() => startEditMachinery(item)} style={styles.editButton}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteMachineryItem(item.id)} style={styles.deleteButton}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
<div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>{item.name}</h3>
                  {(() => {
                    const trackType = getTrackingType(item);
                    const reminders = trackType === 'km' ? getMachineKmReminders(item.name) : getMachineReminders(item.name);
                    const currentMetric = trackType === 'km' ? getMachineKm(item.name) : getMachineHours(item.name);
                    const dueReminders = trackType === 'km' ? reminders.filter(r => isKmReminderDue(r, currentMetric)) : reminders.filter(r => isReminderDue(r, currentMetric));
                    if (dueReminders.length > 0) {
                      return (
                        <span style={{ padding: '4px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '12px', fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ {dueReminders.length} Service{dueReminders.length > 1 ? 's' : ''} Due
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <p style={{ fontSize: '0.8rem', color: currentTheme.textSecondary, margin: '0 0 12px' }}>{item.category || 'N/A'}{item.vinSerial ? ` · ${item.vinSerial}` : ''}{item.licensePlate ? ` · ${item.licensePlate}` : ''}</p>

                {isDesktop && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    border: `1px solid ${currentTheme.cardBorder}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: item.requirements ? '12px' : '0'
                  }}>
                    <div style={{ padding: '10px 14px', borderRight: `1px solid ${currentTheme.cardBorder}` }}>
                      <p style={{ color: currentTheme.textSecondary, fontSize: '0.75rem', margin: '0 0 2px' }}>
                        {CATEGORY_TRACKING_TYPE[item.category] === 'km' ? 'Kilometres' : 'Hours'}
                      </p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: CATEGORY_TRACKING_TYPE[item.category] === 'km' ? '#0891b2' : '#10b981' }}>
                        {CATEGORY_TRACKING_TYPE[item.category] === 'km'
                          ? `${getMachineKm(item.name).toFixed(1)} km`
                          : CATEGORY_TRACKING_TYPE[item.category] === 'none'
                            ? '—'
                            : `${getMachineHours(item.name).toFixed(1)} hrs`}
                      </p>
                    </div>
                    <div style={{ padding: '10px 14px', borderRight: `1px solid ${currentTheme.cardBorder}` }}>
                      <p style={{ color: currentTheme.textSecondary, fontSize: '0.75rem', margin: '0 0 2px' }}>Services</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: currentTheme.text }}>
                        {serviceHistory.filter(r => r.machineName === item.name).length} records
                      </p>
                    </div>
                    <div style={{ padding: '10px 14px', borderRight: `1px solid ${currentTheme.cardBorder}` }}>
                      <p style={{ color: currentTheme.textSecondary, fontSize: '0.75rem', margin: '0 0 2px' }}>Last service</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: currentTheme.text }}>
                        {(() => {
                          const records = serviceHistory.filter(r => r.machineName === item.name).filter(r => r.date);
                          if (records.length === 0) return 'None';
                          const latest = records.sort((a, b) => b.date.localeCompare(a.date))[0];
                          const d = new Date(latest.date + 'T00:00:00');
                          return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
                        })()}
                      </p>
                    </div>
                    <div style={{ padding: '10px 14px' }}>
                      <p style={{ color: currentTheme.textSecondary, fontSize: '0.75rem', margin: '0 0 2px' }}>Reminders</p>
                      {(() => {
                        const trackType = getTrackingType(item);
                        const reminders = trackType === 'km' ? getMachineKmReminders(item.name) : getMachineReminders(item.name);
                        const currentMetric = trackType === 'km' ? getMachineKm(item.name) : getMachineHours(item.name);
                        const due = trackType === 'km' ? reminders.filter(r => isKmReminderDue(r, currentMetric)) : reminders.filter(r => isReminderDue(r, currentMetric));
                        if (due.length > 0) return <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{due.length} overdue</p>;
                        if (reminders.length > 0) return <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: '#10b981' }}>All clear</p>;
                        return <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: currentTheme.textSecondary }}>None set</p>;
                      })()}
                    </div>
                  </div>
                )}

               {!isDesktop && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <div style={{ background: currentTheme.inputBackground, borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '0.625rem', color: currentTheme.textSecondary, margin: '0 0 2px' }}>
                        {CATEGORY_TRACKING_TYPE[item.category] === 'km' ? 'Kilometres' : 'Hours'}
                      </p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: CATEGORY_TRACKING_TYPE[item.category] === 'km' ? '#0891b2' : '#10b981' }}>
                        {CATEGORY_TRACKING_TYPE[item.category] === 'km'
                          ? `${getMachineKm(item.name).toFixed(1)} km`
                          : CATEGORY_TRACKING_TYPE[item.category] === 'none'
                            ? '—'
                            : `${getMachineHours(item.name).toFixed(1)} hrs`}
                      </p>
                    </div>
                    <div style={{ background: currentTheme.inputBackground, borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '0.625rem', color: currentTheme.textSecondary, margin: '0 0 2px' }}>Last service</p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: currentTheme.text }}>
                        {(() => {
                          const records = serviceHistory.filter(r => r.machineName === item.name).filter(r => r.date);
                          if (records.length === 0) return 'None';
                          const latest = records.sort((a, b) => b.date.localeCompare(a.date))[0];
                          const d = new Date(latest.date + 'T00:00:00');
                          return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
                        })()}
                      </p>
                    </div>
                    <div style={{ background: currentTheme.inputBackground, borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '0.625rem', color: currentTheme.textSecondary, margin: '0 0 2px' }}>Services</p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: currentTheme.text }}>
                        {serviceHistory.filter(r => r.machineName === item.name).length} records
                      </p>
                    </div>
                    <div style={{ background: currentTheme.inputBackground, borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '0.625rem', color: currentTheme.textSecondary, margin: '0 0 2px' }}>Reminders</p>
                      {(() => {
                        const trackType = getTrackingType(item);
                        const reminders = trackType === 'km' ? getMachineKmReminders(item.name) : getMachineReminders(item.name);
                        const currentMetric = trackType === 'km' ? getMachineKm(item.name) : getMachineHours(item.name);
                        const due = trackType === 'km' ? reminders.filter(r => isKmReminderDue(r, currentMetric)) : reminders.filter(r => isReminderDue(r, currentMetric));
                        if (due.length > 0) return <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{due.length} overdue</p>;
                        if (reminders.length > 0) return <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: '#10b981' }}>All clear</p>;
                        return <p style={{ fontSize: '0.9375rem', fontWeight: 'bold', margin: 0, color: currentTheme.textSecondary }}>None set</p>;
                      })()}
                    </div>
                  </div>
                )}

                {item.requirements ? (
                  <div style={{ marginTop: '12px', padding: '12px', background: theme === 'light' ? '#fefce8' : '#1f2937', border: theme === 'light' ? '1px solid #fde047' : '1px solid #374151', borderRadius: '8px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Machine Requirements</p>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.requirements}</p>
                  </div>
                ) : null}
              </div>
              {isDesktop && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
  onClick={() => viewMachineServiceHistory(item.name)} 
  style={{
    ...styles.editButton,
    background: theme === 'dark' ? '#8b5cf6' : '#bae6fd',
    color: theme === 'dark' ? 'white' : '#0c4a6e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    whiteSpace: 'nowrap'
  }}
  title="View service history for this machine"
>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: '0.875rem' }}>
                      {serviceHistory.filter(r => r.machineName === item.name).length} Services
                    </span>
                  </button>
                  {userRole !== 'employee' && (
                    <button onClick={() => startEditMachinery(item)} style={styles.editButton}>
                      <Edit2 size={16} />
                    </button>
                  )}
                {userRole !== 'employee' && (
                    <button onClick={() => deleteMachineryItem(item.id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>

    {/* BOTTOM PAGINATION CONTROLS */}
    <div style={{
      padding: '16px',
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      marginTop: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => setMachineryPage(1)}
        disabled={machineryPage === 1}
        style={{
          padding: '8px 16px',
          background: machineryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: machineryPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          opacity: machineryPage === 1 ? 0.5 : 1
        }}
      >
        First
      </button>
      <button
        onClick={() => setMachineryPage(prev => Math.max(1, prev - 1))}
        disabled={machineryPage === 1}
        style={{
          padding: '8px 16px',
          background: machineryPage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: machineryPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          opacity: machineryPage === 1 ? 0.5 : 1
        }}
      >
        Previous
      </button>
      <span style={{ 
        padding: '8px 16px', 
        color: currentTheme.text,
        fontSize: '0.875rem',
        fontWeight: 'bold'
      }}>
        Page {machineryPage} of {getPaginatedMachinery().totalPages}
      </span>
      <button
        onClick={() => setMachineryPage(prev => Math.min(getPaginatedMachinery().totalPages, prev + 1))}
        disabled={machineryPage === getPaginatedMachinery().totalPages}
        style={{
          padding: '8px 16px',
          background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: machineryPage === getPaginatedMachinery().totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          opacity: machineryPage === getPaginatedMachinery().totalPages ? 0.5 : 1
        }}
      >
        Next
      </button>
      <button
        onClick={() => setMachineryPage(getPaginatedMachinery().totalPages)}
        disabled={machineryPage === getPaginatedMachinery().totalPages}
        style={{
          padding: '8px 16px',
          background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: machineryPage === getPaginatedMachinery().totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          opacity: machineryPage === getPaginatedMachinery().totalPages ? 0.5 : 1
        }}
      >
        Last
        </button>
    </div>
  </>
)}
  </>
)}          
</div>
)}
{activeTab === 'service' && (
          <div>
{exportMode === 'service' && (
  <div style={{
    padding: '14px 18px', marginBottom: '16px',
    background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
    borderRadius: '10px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '1.1rem' }}>☑</span>
      <span style={{ fontWeight: '700', color: '#10b981' }}>Export Mode</span>
      <span style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
        {exportServiceSelected.size} record{exportServiceSelected.size !== 1 ? 's' : ''} selected
      </span>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button onClick={() => {
        const visibleIds = new Set(getFilteredAndSortedService().map(i => i.id));
        setExportServiceSelected(prev => new Set([...prev, ...visibleIds]));
      }} style={{
        padding: '8px 14px', background: '#10b981', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
      }}>
        Select All Visible
      </button>
      <button onClick={() => setExportServiceSelected(new Set())} style={{
        padding: '8px 14px', background: '#ef4444', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
      }}>
        Clear All
      </button>
      <button onClick={() => { setActiveTab('settings'); setActiveSettingsSection('importexport'); }} style={{
        padding: '8px 14px', background: '#2563eb', border: 'none',
        borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
      }}>
        Done — Back to Settings
      </button>
    </div>
  </div>
)}
            <div style={styles.tabHeader}>
  <div>
    <h2 style={{ fontSize: '1.5rem' }}>Service Records</h2>
{serviceFilter && (() => {
  const filteredCount = serviceHistory.filter(r => r.machineName === serviceFilter).length;
  
  return (
<div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginTop: '8px',
      padding: '12px 16px',
      background: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(219, 234, 254, 0.8)',
      border: theme === 'dark' ? '1px solid #8b5cf6' : '1px solid #93c5fd',
      borderRadius: '8px',
      flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        color: theme === 'dark' ? '#a78bfa' : '#1e3a5f'
      }}>
        <AlertCircle size={16} />
        {filteredCount === 0 ? (
          <>No records exist for <strong>{serviceFilter}</strong></>
        ) : (
          <>Showing {filteredCount} record{filteredCount === 1 ? '' : 's'} for <strong>{serviceFilter}</strong></>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {filteredCount === 0 && userRole !== 'employee' && (
          <button
            onClick={() => {
              setServiceForm({ 
                machineName: serviceFilter, 
                serviceType: '', 
                date: '', 
                notes: '', 
                technician: '', 
                photoUrls: [] 
              });
              setShowServiceModal(true);
            }}
          style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: theme === 'dark' ? '#8b5cf6' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = theme === 'dark' ? '#7c3aed' : '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = theme === 'dark' ? '#8b5cf6' : '#3b82f6';
            }}
          >
            <Plus size={16} />
            add a new service record?
          </button>
        )}
        
        <button
          onClick={() => setServiceFilter('')}
          style={{
            padding: '6px 12px',
            background: theme === 'dark' ? '#8b5cf6' : '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
           e.target.style.background = theme === 'dark' ? '#7c3aed' : '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = theme === 'dark' ? '#8b5cf6' : '#3b82f6';
          }}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
})()}
  </div>
 {userRole !== 'employee' && (
  <button 
  onClick={() => {
    setServiceForm({ 
      machineName: '', 
      serviceType: '', 
      date: '', 
      notes: '', 
      technician: '', 
      photoUrls: [] 
    });
    setShowServiceModal(true);
  }} 
  style={{
    padding: '12px 24px',
    background: theme === 'light' ? '#86efac' : '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: theme === 'light' ? '#14532d' : 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
      e.target.style.background = theme === 'light' ? '#4ade80' : '#059669';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      e.target.style.background = theme === 'light' ? '#86efac' : '#10b981';
    }}
  >
    <Plus size={20} /> Add Service Record
  </button>
)}
</div>
<div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'nowrap',
  overflow: 'auto'
}}>
  <input
    type="text"
    placeholder="🔍 Search service records (machine, service type, technician, notes)..."
    value={serviceSearch}
    onChange={(e) => {
      setServiceSearch(e.target.value);
      setServicePage(1);
    }}
    style={styles.searchInput}
    autoCorrect="off"
    autoCapitalize="none"
    spellCheck={false}
  />
  <select
    value={serviceSort}
    onChange={(e) => {
      setServiceSort(e.target.value);
      setServicePage(1);
    }}
    style={{
      padding: '10px 12px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '180px',
      flexShrink: 0
    }}
  >
    <option value="date-desc">Date (Newest First)</option>
    <option value="date-asc">Date (Oldest First)</option>
    <option value="recently-added">Recently Added</option>
  </select>
  <select
    value={serviceItemsPerPage}
    onChange={(e) => {
      setServiceItemsPerPage(Number(e.target.value));
      setServicePage(1);
    }}
    style={{
      padding: '10px 12px',
      background: currentTheme.inputBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '8px',
      color: currentTheme.text,
      fontSize: '0.875rem',
      cursor: 'pointer',
      outline: 'none',
      minWidth: '100px',
      flexShrink: 0
    }}
  >
    <option value="25">Show 25</option>
    <option value="50">Show 50</option>
    <option value="100">Show 100</option>
    <option value="200">Show 200</option>
    <option value="500">Show 500</option>
    <option value="1000">Show 1000</option>
    <option value="2000">Show 2000</option>
    <option value="99999">Show All</option>
  </select>
</div>

{serviceHistory.length === 0 ? (
  <div style={styles.emptyState}>
    <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
    <p>No service records yet</p>
  </div>
) : getPaginatedService().totalItems === 0 ? (
  <div style={styles.emptyState}>
    <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
    <p>No records match your search</p>
  </div>
) : (
  <>
    {/* TOP PAGINATION CONTROLS */}
    <div style={{
      padding: '16px',
      background: currentTheme.cardBackground,
      border: `1px solid ${currentTheme.cardBorder}`,
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ color: currentTheme.text }}>
        Showing <strong>{getPaginatedService().startIndex}-{getPaginatedService().endIndex}</strong> of <strong>{getPaginatedService().totalItems}</strong> records
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setServicePage(1)}
          disabled={servicePage === 1}
          style={{
            padding: '8px 16px',
            background: servicePage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: servicePage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: servicePage === 1 ? 0.5 : 1
          }}
        >
          First
        </button>
        <button
          onClick={() => setServicePage(prev => Math.max(1, prev - 1))}
          disabled={servicePage === 1}
          style={{
            padding: '8px 16px',
            background: servicePage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: servicePage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: servicePage === 1 ? 0.5 : 1
          }}
        >
          Previous
        </button>
        <span style={{ 
          padding: '8px 16px', 
          color: currentTheme.text,
          fontSize: '0.875rem',
          fontWeight: 'bold'
        }}>
          Page {servicePage} of {getPaginatedService().totalPages}
        </span>
        <button
          onClick={() => setServicePage(prev => Math.min(getPaginatedService().totalPages, prev + 1))}
          disabled={servicePage === getPaginatedService().totalPages}
          style={{
            padding: '8px 16px',
            background: servicePage === getPaginatedService().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: servicePage === getPaginatedService().totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: servicePage === getPaginatedService().totalPages ? 0.5 : 1
          }}
        >
          Next
        </button>
        <button
          onClick={() => setServicePage(getPaginatedService().totalPages)}
          disabled={servicePage === getPaginatedService().totalPages}
          style={{
            padding: '8px 16px',
            background: servicePage === getPaginatedService().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: servicePage === getPaginatedService().totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: servicePage === getPaginatedService().totalPages ? 0.5 : 1
          }}
        >
          Last
        </button>
      </div>
    </div>

    {/* SERVICE RECORDS LIST */}
    <div style={styles.itemsList}>
{getPaginatedService().items.map(record => (
<div key={record.id} className="item-card" style={{
    ...styles.itemCard,
    outline: exportMode === 'service' && exportServiceSelected.has(record.id)
      ? '2px solid #10b981' : 'none'
  }}>
  {exportMode === 'service' && (
    <input
      type="checkbox"
      checked={exportServiceSelected.has(record.id)}
      onChange={(e) => {
        setExportServiceSelected(prev => {
          const next = new Set(prev);
          e.target.checked ? next.add(record.id) : next.delete(record.id);
          return next;
        });
      }}
      style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, accentColor: '#10b981' }}
    />
  )}
  {editingServiceId === record.id ? (
    <div style={{ flex: 1 }}>

<div style={{ marginBottom: '16px', position: 'relative' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
          Select Machine
        </label>
        <input
          type="text"
          placeholder="🔍 Search or select a machine..."
          value={serviceForm.machineName || machineSearchModal}
          onChange={(e) => {
            setMachineSearchModal(e.target.value);
            setServiceForm({ ...serviceForm, machineName: '' });
            setMachineDropdownOpen(true);
          }}
          onFocus={() => setMachineDropdownOpen(true)}
          onBlur={() => setTimeout(() => setMachineDropdownOpen(false), 150)}
          style={{
            ...styles.input,
            marginBottom: 0,
            backgroundColor: serviceForm.machineName ? (theme === 'light' ? '#f0fdf4' : '#1a3a2a') : styles.input.background,
            borderColor: serviceForm.machineName ? '#10b981' : styles.input.borderColor,
          }}
        />
        {serviceForm.machineName && (
          <button
            onClick={() => {
              setServiceForm({ ...serviceForm, machineName: '' });
              setMachineSearchModal('');
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '30px',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '4px'
            }}
          >✕</button>
        )}
        {machineDropdownOpen && !serviceForm.machineName && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: theme === 'light' ? '#ffffff' : '#1e3a5f',
            border: `1px solid ${theme === 'light' ? '#bfdbfe' : '#2563eb'}`,
            borderRadius: '8px',
            zIndex: 1000,
            maxHeight: '220px',
            overflowY: 'auto',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            marginTop: '4px'
          }}>
            {machinery
              .filter(machine => {
                const searchLower = machineSearchModal.toLowerCase();
                return !searchLower || (
                  machine.name?.toLowerCase().includes(searchLower) ||
                  machine.category?.toLowerCase().includes(searchLower) ||
                  machine.vinSerial?.toLowerCase().includes(searchLower)
                );
              })
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map(machine => (
                <div
                  key={machine.id}
                  onMouseDown={() => {
                    setServiceForm({ ...serviceForm, machineName: machine.name });
                    setMachineSearchModal('');
                    setMachineDropdownOpen(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: theme === 'light' ? '#111827' : 'white',
                    borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d4a6b'}`,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#eff6ff' : '#2d4a6b'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {machine.name}
                  {machine.category && <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}> — {machine.category}</span>}
                </div>
              ))}
            {machinery.filter(m => {
              const s = machineSearchModal.toLowerCase();
              return !s || m.name?.toLowerCase().includes(s) || m.category?.toLowerCase().includes(s) || m.vinSerial?.toLowerCase().includes(s);
            }).length === 0 && (
              <div style={{ padding: '12px 14px', color: '#9ca3af', fontSize: '0.875rem' }}>
                No machines match your search
              </div>
            )}
          </div>
        )}
        {machinery.length === 0 && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px' }}>
            ⚠️ No machinery available. Please add machinery first.
          </p>
        )}
      </div>
      
      <input
        style={styles.input}
        placeholder="Service Type (e.g., Oil Change, Repair)"
        value={serviceForm.serviceType}
        onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
      />
<div style={{ position: 'relative', marginBottom: '16px' }}>
  <input
    style={{ ...styles.input, fontFamily: 'inherit', width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginBottom: 0, position: 'relative', display: 'block', WebkitAppearance: 'none', appearance: 'none', height: '48px' }}
    type="date"
    value={serviceForm.date}
    onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
  />
</div>
<TechnicianField
        value={serviceForm.technician}
        onChange={(val) => setServiceForm({ ...serviceForm, technician: val })}
        styles={styles}
        technicians={technicians}
      />
     <textarea
  style={{ ...styles.input, minHeight: '80px', resize: 'vertical', fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', fontSize: '1rem', whiteSpace: 'pre-wrap', letterSpacing: 'normal' }}
  placeholder="Notes"
  value={serviceForm.notes}
  onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
/>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
          📸 Upload Photos (up to 10)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            const currentCount = serviceForm.photoUrls.length;
            const remainingSlots = 10 - currentCount;
            if (remainingSlots === 0) {
              alert('Maximum 10 photos allowed');
              e.target.value = '';
              return;
            }
            const filesToUpload = files.slice(0, remainingSlots);
            if (files.length > remainingSlots) {
              alert(`Only uploading ${remainingSlots} photo(s) to stay within 10 photo limit`);
            }
            for (const file of filesToUpload) {
              const photoUrl = await handlePhotoUpload(file, 'service');
              if (photoUrl) {
                setServiceForm(prev => ({
                  ...prev,
                  photoUrls: [...prev.photoUrls, photoUrl]
                }));
              }
            }
            e.target.value = '';
          }}
          style={{ ...styles.input, padding: '8px' }}
          disabled={serviceForm.photoUrls.length >= 10 || uploadingPhoto}
        />
        {uploadingPhoto && (
          <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '8px' }}>
            Compressing photo...
          </p>
        )}
        {serviceForm.photoUrls.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            {serviceForm.photoUrls.map((url, index) => (
              <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={url} 
                  alt={`Photo ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    border: '2px solid transparent'
                  }} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewingImage(url);
                    setImageModalTitle(`Service Photo ${index + 1}`);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setServiceForm(prev => ({
                      ...prev,
                      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
                    }));
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  title="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '0.75rem', 
          marginTop: '8px' 
        }}>
          {serviceForm.photoUrls.length} / 10 photos
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button 
          onClick={() => saveServiceEdit(record.id)} 
          style={{
            ...styles.saveButton,
            opacity: savingService ? 0.7 : 1,
            cursor: savingService ? 'not-allowed' : 'pointer'
          }}
          disabled={savingService}
        >
          {savingService ? (
            <>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> 
              Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save
            </>
          )}
        </button>
        <button 
          onClick={cancelServiceEdit} 
          style={styles.cancelButton}
          disabled={savingService}
        >
          <X size={16} /> Cancel
        </button>
      </div>
    </div>
  ) : (
    <>
      {/* Left side - Photo Button instead of photo grid */}
      <div style={{ 
        marginRight: '16px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Photo Button - only show if photos exist */}
        {record.photoUrls && record.photoUrls.length > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setViewingImage(record.photoUrls[0]);
              setViewingImageArray(record.photoUrls);
              setViewingImageIndex(0);
              setImageModalTitle(`${record.machineName} - ${record.serviceType}`);
            }}
            style={{
            padding: '12px 16px',
            background: theme === 'light' ? '#bae6fd' : '#8b5cf6',
            border: 'none',
            borderRadius: '8px',
            color: theme === 'light' ? '#0c4a6e' : 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '100px',
              transition: 'all 0.2s ease'
            }}
           onMouseEnter={(e) => {
              e.target.style.background = theme === 'light' ? '#7dd3fc' : '#7c3aed';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = theme === 'light' ? '#bae6fd' : '#8b5cf6';
              e.target.style.transform = 'scale(1)';
            }}
          >
<span style={{ fontSize: '1.5rem' }}>📸</span>
<span>Open Photos</span>
<span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
  ({record.photoUrls.length} photo{record.photoUrls.length !== 1 ? 's' : ''})
</span>
          </button>
        )}
        
        {/* Mobile Edit/Delete Buttons */}
        {!isDesktop && userRole !== 'employee' && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button onClick={() => startEditService(record)} style={styles.editButton}>
              <Edit2 size={16} />
            </button>
            <button onClick={() => deleteServiceRecord(record.id)} style={styles.deleteButton}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Right side - Service details */}
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '1rem',
          marginBottom: '8px',
          wordBreak: 'break-word'
        }}>
          {record.machineName}
        </h3>
        <p style={{ 
          color: '#06b6d4', 
          fontSize: '0.875rem',
          marginBottom: '12px',
          wordBreak: 'break-word'
        }}>
          {record.serviceType}
        </p>
        <div style={{ ...styles.itemDetails, gridTemplateColumns: isDesktop ? 'repeat(4, minmax(120px, 1fr))' : 'repeat(2, 1fr)' }}>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Date</p>
            <p>{record.date || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Technician</p>
            <p>{record.technician || 'N/A'}</p>
          </div>
        </div>
{record.notes && (
  <div style={{ 
    marginTop: '12px', 
    padding: '12px', 
    background: theme === 'light' ? '#f0f9ff' : '#1f2937', 
    borderRadius: '8px', 
    minHeight: '80px',
    width: isDesktop ? 'calc(100% + 90px)' : '100%',
    marginLeft: isDesktop ? '-90px' : '0'
  }}>
    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Notes:</p>
    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{record.notes}</p>
  </div>
)}
      </div>

      {/* Desktop Edit/Delete Buttons */}
      {isDesktop && userRole !== 'employee' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => startEditService(record)} style={styles.editButton}>
            <Edit2 size={16} />
          </button>
          <button onClick={() => deleteServiceRecord(record.id)} style={styles.deleteButton}>
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </>
  )}
</div>
))}
              </div>
              {/* BOTTOM PAGINATION CONTROLS */}
              <div style={{
                padding: '16px',
                background: currentTheme.cardBackground,
                border: `1px solid ${currentTheme.cardBorder}`,
                borderRadius: '12px',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
               <button
                  onClick={() => setServicePage(1)}
                  disabled={servicePage === 1}
                  style={{
                    padding: '8px 16px',
                    background: servicePage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: servicePage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: servicePage === 1 ? 0.5 : 1
                  }}
                >
                  First
                </button>
                <button
                  onClick={() => setServicePage(prev => Math.max(1, prev - 1))}
                  disabled={servicePage === 1}
                  style={{
                    padding: '8px 16px',
                    background: servicePage === 1 ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: servicePage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: servicePage === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                <span style={{ 
                  padding: '8px 16px', 
                  color: currentTheme.text,
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  Page {servicePage} of {getPaginatedService().totalPages}
                </span>
                <button
                  onClick={() => setServicePage(prev => Math.min(getPaginatedService().totalPages, prev + 1))}
                  disabled={servicePage === getPaginatedService().totalPages}
                  style={{
                    padding: '8px 16px',
                    background: servicePage === getPaginatedService().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: servicePage === getPaginatedService().totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: servicePage === getPaginatedService().totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
                <button
                  onClick={() => setServicePage(getPaginatedService().totalPages)}
                  disabled={servicePage === getPaginatedService().totalPages}
                  style={{
                    padding: '8px 16px',
                    background: servicePage === getPaginatedService().totalPages ? '#4b5563' : (theme === 'light' ? '#86efac' : '#10b981'),
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: servicePage === getPaginatedService().totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: servicePage === getPaginatedService().totalPages ? 0.5 : 1
                  }}
                >
                  Last
                </button>
              </div>
            </>                
          )}
        </div>
      )}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', minHeight: '100%' }}>
            <div style={{ flex: 1, padding: '24px' }}>
              <div style={styles.tabHeader}>
                <h2 style={{ fontSize: '1.5rem' }}>Settings</h2>
              </div>

              {activeSettingsSection === 'general' && (
                <div style={styles.itemCard}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>⚙️ General Settings</h3>
                    <div style={styles.itemDetails}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Application Theme</p>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            onClick={() => setTheme('dark')}
                            style={{
                              padding: '10px 20px',
                              background: theme === 'dark' ? 'linear-gradient(to right, #10b981, #06b6d4)' : '#374151',
                              border: theme === 'dark' ? '2px solid #10b981' : '1px solid #4b5563',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: theme === 'dark' ? 'bold' : 'normal',
                            }}
                          >
                            🌙 Dark Mode
                          </button>
                          <button
                            onClick={() => setTheme('light')}
                            style={{
                              padding: '10px 20px',
                              background: theme === 'light' ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : '#374151',
                              border: theme === 'light' ? '2px solid #fbbf24' : '1px solid #4b5563',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: theme === 'light' ? 'bold' : 'normal',
                            }}
                          >
                            ☀️ Light Mode
                          </button>
                        </div>
                      </div>     
                    <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Language</p>
                        <p>English (US)</p>
                      </div>
                    </div>
                    {userRole !== 'employee' && (
                      <div style={{ marginTop: '24px' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '12px' }}>
👷 Technician List
                        </p>
                        <button
                          onClick={() => setShowTechnicianList(prev => !prev)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 14px',
                            background: showTechnicianList
                              ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
                              : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
                            border: `1px solid ${showTechnicianList ? '#10b981' : currentTheme.cardBorder}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: currentTheme.text,
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '12px',
                          }}
                        >
                          <span>  Manage Technicians ({technicians.length})</span>
                          <span style={{
                            transition: 'transform 0.2s ease',
                            transform: showTechnicianList ? 'rotate(180deg)' : 'rotate(0deg)',
                            display: 'inline-block',
                          }}>▼</span>
                        </button>
                        {showTechnicianList && (
                          <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                              {technicians.length === 0 && (
                                <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem' }}>
                                  No technicians added yet.
                                </p>
                              )}
                              {technicians.map(t => (
                                <div key={t.id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  background: currentTheme.inputBackground,
                                  border: `1px solid ${currentTheme.cardBorder}`,
                                  borderRadius: '8px',
                                  gap: '8px',
                                }}>
                                  {editingTechnicianId === t.id ? (
                                    <>
                                      <input
                                        style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                        value={editingTechnicianName}
                                        onChange={(e) => setEditingTechnicianName(e.target.value)}
                                        onKeyDown={async (e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (!editingTechnicianName.trim()) return;
                                            const { error } = await supabase
                                              .from('technicians')
                                              .update({ name: editingTechnicianName.trim() })
                                              .eq('id', t.id);
                                            if (error) { alert('Failed to update: ' + error.message); return; }
                                            setTechnicians(prev => prev.map(x =>
                                              x.id === t.id ? { ...x, name: editingTechnicianName.trim() } : x
                                            ).sort((a, b) => {
                                              const lastA = a.name.trim().split(' ').pop().toLowerCase();
                                              const lastB = b.name.trim().split(' ').pop().toLowerCase();
                                              return lastA.localeCompare(lastB);
                                            }));
                                            setEditingTechnicianId(null);
                                            setEditingTechnicianName('');
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingTechnicianId(null);
                                            setEditingTechnicianName('');
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={async () => {
                                          if (!editingTechnicianName.trim()) return;
                                          const { error } = await supabase
                                            .from('technicians')
                                            .update({ name: editingTechnicianName.trim() })
                                            .eq('id', t.id);
                                          if (error) { alert('Failed to update: ' + error.message); return; }
                                          setTechnicians(prev => prev.map(x =>
                                            x.id === t.id ? { ...x, name: editingTechnicianName.trim() } : x
                                          ).sort((a, b) => {
                                            const lastA = a.name.trim().split(' ').pop().toLowerCase();
                                            const lastB = b.name.trim().split(' ').pop().toLowerCase();
                                            return lastA.localeCompare(lastB);
                                          }));
                                          setEditingTechnicianId(null);
                                          setEditingTechnicianName('');
                                        }}
                                        style={{
                                          padding: '4px 10px',
                                          background: '#10b981',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: 'white',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingTechnicianId(null);
                                          setEditingTechnicianName('');
                                        }}
                                        style={{
                                          padding: '4px 10px',
                                          background: '#4b5563',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: 'white',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ color: currentTheme.text, flex: 1 }}>{t.name}</span>
                                      <button
                                        onClick={() => {
                                          setEditingTechnicianId(t.id);
                                          setEditingTechnicianName(t.name);
                                        }}
                                        style={{
                                          padding: '4px 10px',
                                          background: theme === 'light' ? '#bae6fd' : '#0891b2',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: theme === 'light' ? '#0c4a6e' : 'white',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!confirm(`Remove "${t.name}" from the technician list?`)) return;
                                          const { error } = await supabase
                                            .from('technicians')
                                            .delete()
                                            .eq('id', t.id);
                                          if (error) { alert('Failed to remove: ' + error.message); return; }
                                          setTechnicians(prev => prev.filter(x => x.id !== t.id));
                                        }}
                                        style={{
                                          padding: '4px 10px',
                                          background: theme === 'light' ? '#fca5a5' : '#7f1d1d',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: theme === 'light' ? '#7f1d1d' : 'white',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                                placeholder="Add technician name..."
                                value={newTechnicianName}
                                onChange={(e) => setNewTechnicianName(e.target.value)}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (!newTechnicianName.trim()) return;
                                    const { data, error } = await supabase
                                      .from('technicians')
                                      .insert([{ name: newTechnicianName.trim(), user_id: user.id }])
                                      .select();
                                    if (error) { alert('Failed to add: ' + error.message); return; }
                                    if (data?.[0]) setTechnicians(prev => [...prev, data[0]].sort((a, b) => {
                                      const lastA = a.name.trim().split(' ').pop().toLowerCase();
                                      const lastB = b.name.trim().split(' ').pop().toLowerCase();
                                      return lastA.localeCompare(lastB);
                                    }));
                                    setNewTechnicianName('');
                                  }
                                }}
                              />
                              <button
                                onClick={async () => {
                                  if (!newTechnicianName.trim()) return;
                                  const { data, error } = await supabase
                                    .from('technicians')
                                    .insert([{ name: newTechnicianName.trim(), user_id: user.id }])
                                    .select();
                                  if (error) { alert('Failed to add: ' + error.message); return; }
                                  if (data?.[0]) setTechnicians(prev => [...prev, data[0]].sort((a, b) => {
                                    const lastA = a.name.trim().split(' ').pop().toLowerCase();
                                    const lastB = b.name.trim().split(' ').pop().toLowerCase();
                                    return lastA.localeCompare(lastB);
                                  }));
                                  setNewTechnicianName('');
                                }}
                                style={{
                                  padding: '12px 20px',
                                  background: theme === 'light' ? '#86efac' : '#10b981',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: theme === 'light' ? '#14532d' : 'white',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
             {activeSettingsSection === 'account' && (
  <>
    {/* Account Information Card */}
    <div style={styles.itemCard}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>👤 Account Information</h3>
        <div style={styles.itemDetails}>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Email</p>
            <p>{user?.email || 'Not available'}</p>
          </div>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>User ID</p>
            <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
          {user?.id || 'Not available'}
            </p>
          </div>
          <div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Access Level</p>
            <p style={{ 
              textTransform: 'capitalize', 
              fontWeight: 'bold', 
              color: userRole === 'employee' ? '#9ca3af' : '#10b981' 
            }}>
              {userRole === 'employee' ? 'Employee (View Only)' : 'Admin/Manager (Full Access)'}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Password Recovery Card */}
    <div style={{
      ...styles.itemCard,
      marginTop: '24px',
      background: theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : '#f0f9ff',
      border: `1px solid ${theme === 'dark' ? '#2563eb' : '#3b82f6'}`
    }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#3b82f6' }}>
          🔐 Password Management
        </h3>
        
        {!showPasswordRecovery ? (
          <>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '16px' }}>
              Need to reset your password? We'll send you an email with instructions to create a new password.
            </p>
            <button
              onClick={() => setShowPasswordRecovery(true)}
              style={{
                padding: '12px 24px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1d4ed8';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <Mail size={20} />
              Reset Password
            </button>
          </>
        ) : (
          <>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '16px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <input
              type="email"
              placeholder="Enter your email address"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              style={{
                ...styles.input,
                marginBottom: '8px'
              }}
            />
            
            {recoveryError && (
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '12px'
              }}>
                {recoveryError}
              </div>
            )}
            
            {recoveryMessage && (
              <div style={{
                padding: '12px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '0.875rem',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Mail size={16} />
                {recoveryMessage}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handlePasswordRecovery}
                disabled={sendingRecovery || !recoveryEmail.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: sendingRecovery || !recoveryEmail.trim() ? '#6b7280' : '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: sendingRecovery || !recoveryEmail.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: sendingRecovery || !recoveryEmail.trim() ? 0.6 : 1
                }}
              >
                {sendingRecovery ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Recovery Email
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowPasswordRecovery(false);
                  setRecoveryEmail('');
                  setRecoveryError('');
                  setRecoveryMessage('');
                }}
                disabled={sendingRecovery}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4b5563',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: sendingRecovery ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: sendingRecovery ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </>
)}

              {activeSettingsSection === 'application' && (
                <>
                  <div style={styles.itemCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>📊 Application Info</h3>
                      <div style={styles.itemDetails}>
                        <div>
                          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Real-time Status</p>
                          <p style={{ color: realtimeStatus === 'connected' ? '#10b981' : '#ef4444' }}>
                            {realtimeStatus === 'connected' ? '✓ Connected' : '⚠️ Disconnected'}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Last Sync</p>
                          <p>{lastSync?.toLocaleString() || 'Never'}</p>
                        </div>
                        <div>
                          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Items</p>
                          <p>
                            {inventory.length} inventory, {machinery.length} machines, {serviceHistory.length} records
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.itemCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Actions</h3>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={() => window.location.reload()} style={styles.primaryButton}>
                          <RefreshCw size={16} style={{ marginRight: '8px' }} />
                          Refresh Application
                        </button>
                        <button
                          onClick={handleLogout}
                          style={{ ...styles.secondaryButton, background: '#ef4444' }}
                        >
                          <LogOut size={16} style={{ marginRight: '8px' }} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSettingsSection === 'importexport' && (
                <div style={styles.itemCard}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>📁 Import/Export Data</h3>
                    <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                      Export and import your data to CSV format
                    </p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

  {/* ── EXPORT INVENTORY ── */}
  <div style={{
    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
    borderRadius: '10px',
    overflow: 'hidden'
  }}>
    <button
      onClick={() => setExportInventoryOpen(o => !o)}
      style={{
        width: '100%', padding: '14px 18px',
        background: exportInventoryOpen
          ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
          : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
        border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
      }}
    >
      <span>📦 Export Inventory</span>
      <span style={{
        transition: 'transform 0.2s ease',
        transform: exportInventoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        display: 'inline-block'
      }}>▼</span>
    </button>

    {exportInventoryOpen && (
      <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['all', 'daterange', 'manual'].map(tab => (
            <button key={tab} onClick={() => setExportInventoryTab(tab)} style={{
              padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: exportInventoryTab === tab ? '700' : '400',
              background: exportInventoryTab === tab
                ? 'linear-gradient(to right, #10b981, #06b6d4)'
                : (theme === 'light' ? '#e5e7eb' : '#374151'),
              color: exportInventoryTab === tab ? 'white' : currentTheme.text,
            }}>
              {tab === 'all' ? 'Export All' : tab === 'daterange' ? 'Date Range' : 'Manual Select'}
            </button>
          ))}
        </div>

        {/* Export All */}
        {exportInventoryTab === 'all' && (
          <div>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '12px', fontSize: '0.875rem' }}>
              This will export all <strong style={{ color: currentTheme.text }}>{inventory.length}</strong> inventory items.
            </p>
            <button onClick={() => exportToCSV(
              getInventoryRows(inventory),
              ['Name', 'Part Number', 'Quantity', 'Location', 'Min Qty', 'Max Qty'],
              'inventory-all.csv'
            )} style={{
              padding: '10px 20px', background: '#10b981', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
            }}>
              ⬇ Download CSV
            </button>
          </div>
        )}

        {/* Date Range */}
        {exportInventoryTab === 'daterange' && (() => {
          const hasNonTimestamp = inventory.some(i => !isTimestampId(i.id));
          const filtered = inventory.filter(i => {
            const d = idToDate(i.id);
            if (!d) return false;
            const start = exportInventoryDateStart ? new Date(exportInventoryDateStart) : null;
            const end = exportInventoryDateEnd ? new Date(exportInventoryDateEnd + 'T23:59:59') : null;
            if (start && d < start) return false;
            if (end && d > end) return false;
            return true;
          });
          return (
            <div>
              {hasNonTimestamp && (
                <div style={{
                  padding: '10px 14px', marginBottom: '12px',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b',
                  borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b'
                }}>
                  ⚠️ Some items were added before timestamp IDs were used and won't appear in date range results.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" value={exportInventoryDateStart}
                    onChange={e => setExportInventoryDateStart(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>End Date</label>
                  <input type="date" value={exportInventoryDateEnd}
                    onChange={e => setExportInventoryDateEnd(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
              </div>
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                <strong style={{ color: currentTheme.text }}>{filtered.length}</strong> items match this date range.
              </p>
              <button
                onClick={() => exportToCSV(
                  getInventoryRows(filtered),
                  ['Name', 'Part Number', 'Quantity', 'Location', 'Min Qty', 'Max Qty'],
                  'inventory-daterange.csv'
                )}
                disabled={filtered.length === 0}
                style={{
                  padding: '10px 20px', border: 'none', borderRadius: '8px',
                  color: 'white', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: '600',
                  background: filtered.length === 0 ? '#6b7280' : '#10b981',
                  opacity: filtered.length === 0 ? 0.6 : 1
                }}>
                ⬇ Download CSV
              </button>
            </div>
          );
        })()}

        {/* Manual Select */}
        {exportInventoryTab === 'manual' && (
          <div>
            {exportMode === 'inventory' ? (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem', color: '#10b981'
              }}>
                ✅ Export mode active — go to the Inventory tab to select items.
              </div>
            ) : (
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                Click below to go to the Inventory tab and select items to export.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button onClick={() => { setExportMode('inventory'); setActiveTab('inventory'); }} style={{
                padding: '10px 20px', background: '#10b981', border: 'none',
                borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
              }}>
                {exportMode === 'inventory' ? '↩ Back to Inventory' : '☑ Select Items'}
              </button>
              {exportInventorySelected.size > 0 && (
                <button onClick={() => setExportInventorySelected(new Set())} style={{
                  padding: '10px 20px', background: '#ef4444', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}>
                  Clear Selection
                </button>
              )}
            </div>
            <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
              <strong style={{ color: currentTheme.text }}>{exportInventorySelected.size}</strong> items selected.
            </p>
            <button
              onClick={() => {
                const selected = inventory.filter(i => exportInventorySelected.has(i.id));
                exportToCSV(
                  getInventoryRows(selected),
                  ['Name', 'Part Number', 'Quantity', 'Location', 'Min Qty', 'Max Qty'],
                  'inventory-selected.csv'
                );
              }}
              disabled={exportInventorySelected.size === 0}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: '8px',
                color: 'white', cursor: exportInventorySelected.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
                background: exportInventorySelected.size === 0 ? '#6b7280' : '#10b981',
                opacity: exportInventorySelected.size === 0 ? 0.6 : 1
              }}>
              ⬇ Download CSV
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  {/* ── EXPORT MACHINERY ── */}
  <div style={{
    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
    borderRadius: '10px',
    overflow: 'hidden'
  }}>
    <button
      onClick={() => setExportMachineryOpen(o => !o)}
      style={{
        width: '100%', padding: '14px 18px',
        background: exportMachineryOpen
          ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
          : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
        border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
      }}
    >
      <span>🚜 Export Machinery</span>
      <span style={{
        transition: 'transform 0.2s ease',
        transform: exportMachineryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        display: 'inline-block'
      }}>▼</span>
    </button>

    {exportMachineryOpen && (
      <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['all', 'daterange', 'manual'].map(tab => (
            <button key={tab} onClick={() => setExportMachineryTab(tab)} style={{
              padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: exportMachineryTab === tab ? '700' : '400',
              background: exportMachineryTab === tab
                ? 'linear-gradient(to right, #10b981, #06b6d4)'
                : (theme === 'light' ? '#e5e7eb' : '#374151'),
              color: exportMachineryTab === tab ? 'white' : currentTheme.text,
            }}>
              {tab === 'all' ? 'Export All' : tab === 'daterange' ? 'Date Range' : 'Manual Select'}
            </button>
          ))}
        </div>

        {exportMachineryTab === 'all' && (
          <div>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '12px', fontSize: '0.875rem' }}>
              This will export all <strong style={{ color: currentTheme.text }}>{machinery.length}</strong> machinery items.
            </p>
            <button onClick={() => exportToCSV(
              getMachineryRows(machinery),
              ['Name', 'VIN/Serial', 'Category', 'Status', 'License Plate'],
              'machinery-all.csv'
            )} style={{
              padding: '10px 20px', background: '#10b981', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
            }}>
              ⬇ Download CSV
            </button>
          </div>
        )}

        {exportMachineryTab === 'daterange' && (() => {
          const hasNonTimestamp = machinery.some(i => !isTimestampId(i.id));
          const filtered = machinery.filter(i => {
            const d = idToDate(i.id);
            if (!d) return false;
            const start = exportMachineryDateStart ? new Date(exportMachineryDateStart) : null;
            const end = exportMachineryDateEnd ? new Date(exportMachineryDateEnd + 'T23:59:59') : null;
            if (start && d < start) return false;
            if (end && d > end) return false;
            return true;
          });
          return (
            <div>
              {hasNonTimestamp && (
                <div style={{
                  padding: '10px 14px', marginBottom: '12px',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b',
                  borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b'
                }}>
                  ⚠️ Some machines were added before timestamp IDs were used and won't appear in date range results.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" value={exportMachineryDateStart}
                    onChange={e => setExportMachineryDateStart(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>End Date</label>
                  <input type="date" value={exportMachineryDateEnd}
                    onChange={e => setExportMachineryDateEnd(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
              </div>
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                <strong style={{ color: currentTheme.text }}>{filtered.length}</strong> machines match this date range.
              </p>
              <button
                onClick={() => exportToCSV(
                  getMachineryRows(filtered),
                  ['Name', 'VIN/Serial', 'Category', 'Status', 'License Plate'],
                  'machinery-daterange.csv'
                )}
                disabled={filtered.length === 0}
                style={{
                  padding: '10px 20px', border: 'none', borderRadius: '8px',
                  color: 'white', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: '600',
                  background: filtered.length === 0 ? '#6b7280' : '#10b981',
                  opacity: filtered.length === 0 ? 0.6 : 1
                }}>
                ⬇ Download CSV
              </button>
            </div>
          );
        })()}

        {exportMachineryTab === 'manual' && (
          <div>
            {exportMode === 'machinery' ? (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem', color: '#10b981'
              }}>
                ✅ Export mode active — go to the Machinery tab to select items.
              </div>
            ) : (
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                Click below to go to the Machinery tab and select items to export.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button onClick={() => { setExportMode('machinery'); setActiveTab('machinery'); }} style={{
                padding: '10px 20px', background: '#10b981', border: 'none',
                borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
              }}>
                {exportMode === 'machinery' ? '↩ Back to Machinery' : '☑ Select Items'}
              </button>
              {exportMachinerySelected.size > 0 && (
                <button onClick={() => setExportMachinerySelected(new Set())} style={{
                  padding: '10px 20px', background: '#ef4444', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}>
                  Clear Selection
                </button>
              )}
            </div>
            <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
              <strong style={{ color: currentTheme.text }}>{exportMachinerySelected.size}</strong> items selected.
            </p>
            <button
              onClick={() => {
                const selected = machinery.filter(i => exportMachinerySelected.has(i.id));
                exportToCSV(
                  getMachineryRows(selected),
                  ['Name', 'VIN/Serial', 'Category', 'Status', 'License Plate'],
                  'machinery-selected.csv'
                );
              }}
              disabled={exportMachinerySelected.size === 0}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: '8px',
                color: 'white', cursor: exportMachinerySelected.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
                background: exportMachinerySelected.size === 0 ? '#6b7280' : '#10b981',
                opacity: exportMachinerySelected.size === 0 ? 0.6 : 1
              }}>
              ⬇ Download CSV
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  {/* ── EXPORT SERVICE RECORDS ── */}
  <div style={{
    border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
    borderRadius: '10px',
    overflow: 'hidden'
  }}>
    <button
      onClick={() => setExportServiceOpen(o => !o)}
      style={{
        width: '100%', padding: '14px 18px',
        background: exportServiceOpen
          ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
          : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
        border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
      }}
    >
      <span>🔧 Export Service Records</span>
      <span style={{
        transition: 'transform 0.2s ease',
        transform: exportServiceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        display: 'inline-block'
      }}>▼</span>
    </button>

    {exportServiceOpen && (
      <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['all', 'daterange', 'manual'].map(tab => (
            <button key={tab} onClick={() => setExportServiceTab(tab)} style={{
              padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: exportServiceTab === tab ? '700' : '400',
              background: exportServiceTab === tab
                ? 'linear-gradient(to right, #10b981, #06b6d4)'
                : (theme === 'light' ? '#e5e7eb' : '#374151'),
              color: exportServiceTab === tab ? 'white' : currentTheme.text,
            }}>
              {tab === 'all' ? 'Export All' : tab === 'daterange' ? 'Date Range' : 'Manual Select'}
            </button>
          ))}
        </div>

        {exportServiceTab === 'all' && (
          <div>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '12px', fontSize: '0.875rem' }}>
              This will export all <strong style={{ color: currentTheme.text }}>{serviceHistory.length}</strong> service records.
            </p>
            <button onClick={() => exportToCSV(
              getServiceRows(serviceHistory),
              ['Machine', 'Service Type', 'Date', 'Technician', 'Notes'],
              'service-records-all.csv'
            )} style={{
              padding: '10px 20px', background: '#10b981', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
            }}>
              ⬇ Download CSV
            </button>
          </div>
        )}

        {exportServiceTab === 'daterange' && (() => {
          const filtered = serviceHistory.filter(r => {
            if (!r.date) return false;
            const start = exportServiceDateStart ? new Date(exportServiceDateStart) : null;
            const end = exportServiceDateEnd ? new Date(exportServiceDateEnd + 'T23:59:59') : null;
            const d = new Date(r.date);
            if (start && d < start) return false;
            if (end && d > end) return false;
            return true;
          });
          return (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" value={exportServiceDateStart}
                    onChange={e => setExportServiceDateStart(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '4px' }}>End Date</label>
                  <input type="date" value={exportServiceDateEnd}
                    onChange={e => setExportServiceDateEnd(e.target.value)}
                    style={{ ...styles.input, marginBottom: 0, fontFamily: 'inherit' }} />
                </div>
              </div>
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                <strong style={{ color: currentTheme.text }}>{filtered.length}</strong> records match this date range.
              </p>
              <button
                onClick={() => exportToCSV(
                  getServiceRows(filtered),
                  ['Machine', 'Service Type', 'Date', 'Technician', 'Notes'],
                  'service-records-daterange.csv'
                )}
                disabled={filtered.length === 0}
                style={{
                  padding: '10px 20px', border: 'none', borderRadius: '8px',
                  color: 'white', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: '600',
                  background: filtered.length === 0 ? '#6b7280' : '#10b981',
                  opacity: filtered.length === 0 ? 0.6 : 1
                }}>
                ⬇ Download CSV
              </button>
            </div>
          );
        })()}

        {exportServiceTab === 'manual' && (
          <div>
            {exportMode === 'service' ? (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem', color: '#10b981'
              }}>
                ✅ Export mode active — go to the Service tab to select records.
              </div>
            ) : (
              <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
                Click below to go to the Service tab and select records to export.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button onClick={() => { setExportMode('service'); setActiveTab('service'); }} style={{
                padding: '10px 20px', background: '#10b981', border: 'none',
                borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
              }}>
                {exportMode === 'service' ? '↩ Back to Service' : '☑ Select Records'}
              </button>
              {exportServiceSelected.size > 0 && (
                <button onClick={() => setExportServiceSelected(new Set())} style={{
                  padding: '10px 20px', background: '#ef4444', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}>
                  Clear Selection
                </button>
              )}
            </div>
            <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
              <strong style={{ color: currentTheme.text }}>{exportServiceSelected.size}</strong> records selected.
            </p>
            <button
              onClick={() => {
                const selected = serviceHistory.filter(i => exportServiceSelected.has(i.id));
                exportToCSV(
                  getServiceRows(selected),
                  ['Machine', 'Service Type', 'Date', 'Technician', 'Notes'],
                  'service-records-selected.csv'
                );
              }}
              disabled={exportServiceSelected.size === 0}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: '8px',
                color: 'white', cursor: exportServiceSelected.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: '600',
                background: exportServiceSelected.size === 0 ? '#6b7280' : '#10b981',
                opacity: exportServiceSelected.size === 0 ? 0.6 : 1
              }}>
              ⬇ Download CSV
            </button>
          </div>
        )}
      </div>
    )}
  </div>

   {/* ── IMPORT INVENTORY ── */}
<div style={{
  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <button
    onClick={() => {
      setImportInventoryOpen(o => !o);
      setImportInventoryResult(null);
      setImportInventoryPreview(null);
    }}
    style={{
      width: '100%', padding: '14px 18px',
      background: importInventoryOpen
        ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
        : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
      border: 'none', cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
    }}
  >
    <span>📥 Import Inventory</span>
    <span style={{
      transition: 'transform 0.2s ease',
      transform: importInventoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      display: 'inline-block'
    }}>▼</span>
  </button>

  {importInventoryOpen && (
    <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['upload', 'template'].map(tab => (
          <button key={tab} onClick={() => setImportInventoryTab(tab)} style={{
            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: importInventoryTab === tab ? '700' : '400',
            background: importInventoryTab === tab
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : (theme === 'light' ? '#e5e7eb' : '#374151'),
            color: importInventoryTab === tab ? 'white' : currentTheme.text,
          }}>
            {tab === 'upload' ? '⬆ Upload CSV' : '📄 Download Template'}
          </button>
        ))}
      </div>

      {importInventoryTab === 'template' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '8px' }}>
            Download a blank CSV template with the correct column headers and an example row.
          </p>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '16px' }}>
            Columns: <strong style={{ color: currentTheme.text }}>Name, Part Number, Quantity, Location, Min Qty, Max Qty</strong>
          </p>
          <button
            onClick={() => downloadTemplate('inventory')}
            style={{
              padding: '10px 20px', background: '#0891b2', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: '600'
            }}
          >
            ⬇ Download Template
          </button>
        </div>
      )}

      {importInventoryTab === 'upload' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
            Upload a CSV file to import inventory items. Use the Template tab to get the correct format.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setImportInventoryResult(null);
              const text = await file.text();
              const parsed = parseImportCSV(text, 'inventory');
              setImportInventoryPreview(parsed);
              e.target.value = '';
            }}
            style={{
              ...styles.input,
              padding: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}
          />

          {/* Preview */}
          {importInventoryPreview && !importInventoryResult && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                padding: '12px 16px',
                background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                borderRadius: '10px',
                marginBottom: '10px'
              }}>
                <p style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✅ {importInventoryPreview.rows.length} row{importInventoryPreview.rows.length !== 1 ? 's' : ''} ready to import
                </p>
                <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', margin: 0 }}>
                  File parsed successfully.
                </p>
              </div>

              {importInventoryPreview.duplicates.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fff7ed' : 'rgba(249,115,22,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fdba74' : 'rgba(249,115,22,0.4)'}`,
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: theme === 'light' ? '#9a3412' : '#fb923c', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ⚠️ {importInventoryPreview.duplicates.length} possible duplicate{importInventoryPreview.duplicates.length !== 1 ? 's' : ''} detected
                  </p>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '8px' }}>
                    These items already exist and will be imported as additional entries:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importInventoryPreview.duplicates.map((d, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#9a3412' : '#fb923c', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        Row {d.rowIndex}: {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importInventoryPreview.errors.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ❌ {importInventoryPreview.errors.length} row{importInventoryPreview.errors.length !== 1 ? 's' : ''} will be skipped
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importInventoryPreview.errors.map((err, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importInventoryPreview.rows.length > 0 && (
                <button
                  onClick={() => runImport('inventory', importInventoryPreview.rows)}
                  disabled={importingInventory}
                  style={{
                    width: '100%', padding: '12px',
                    background: importingInventory ? '#6b7280' : 'linear-gradient(to right, #10b981, #06b6d4)',
                    border: 'none', borderRadius: '10px', color: 'white',
                    cursor: importingInventory ? 'not-allowed' : 'pointer',
                    fontSize: '1rem', fontWeight: '700'
                  }}
                >
                  {importingInventory ? 'Importing...' : `⬆ Import ${importInventoryPreview.rows.length} Item${importInventoryPreview.rows.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          )}

          {/* Result */}
          {importInventoryResult && (
            <div>
              {importInventoryResult.succeeded.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem', marginBottom: '4px' }}>
                    ✅ {importInventoryResult.succeeded.length} item{importInventoryResult.succeeded.length !== 1 ? 's' : ''} imported successfully
                  </p>
                </div>
              )}
              {importInventoryResult.failed.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.875rem', marginBottom: '8px' }}>
                    ❌ {importInventoryResult.failed.length} item{importInventoryResult.failed.length !== 1 ? 's' : ''} failed
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importInventoryResult.failed.map((f, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {f.name}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => {
                  setImportInventoryPreview(null);
                  setImportInventoryResult(null);
                }}
                style={{
                  padding: '10px 20px', background: '#4b5563', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
            Import Another File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
{/* ── IMPORT MACHINERY ── */}
<div style={{
  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <button
    onClick={() => {
      setImportMachineryOpen(o => !o);
      setImportMachineryResult(null);
      setImportMachineryPreview(null);
    }}
    style={{
      width: '100%', padding: '14px 18px',
      background: importMachineryOpen
        ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
        : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
      border: 'none', cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
    }}
  >
    <span>📥 Import Machinery</span>
    <span style={{
      transition: 'transform 0.2s ease',
      transform: importMachineryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      display: 'inline-block'
    }}>▼</span>
  </button>

  {importMachineryOpen && (
    <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['upload', 'template'].map(tab => (
          <button key={tab} onClick={() => setImportMachineryTab(tab)} style={{
            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: importMachineryTab === tab ? '700' : '400',
            background: importMachineryTab === tab
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : (theme === 'light' ? '#e5e7eb' : '#374151'),
            color: importMachineryTab === tab ? 'white' : currentTheme.text,
          }}>
            {tab === 'upload' ? '⬆ Upload CSV' : '📄 Download Template'}
          </button>
        ))}
      </div>

      {importMachineryTab === 'template' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '8px' }}>
            Download a blank CSV template with the correct column headers and an example row.
          </p>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '8px' }}>
            Columns: <strong style={{ color: currentTheme.text }}>Name, VIN/Serial, Category, Status, License Plate</strong>
          </p>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '16px' }}>
            Valid categories: <strong style={{ color: currentTheme.text }}>{MACHINERY_CATEGORIES.join(', ')}</strong>
          </p>
          <button
            onClick={() => downloadTemplate('machinery')}
            style={{
              padding: '10px 20px', background: '#0891b2', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: '600'
            }}
          >
            ⬇ Download Template
          </button>
        </div>
      )}

      {importMachineryTab === 'upload' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
            Upload a CSV file to import machinery. Use the Template tab to get the correct format.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setImportMachineryResult(null);
              const text = await file.text();
              const parsed = parseImportCSV(text, 'machinery');
              setImportMachineryPreview(parsed);
              e.target.value = '';
            }}
            style={{
              ...styles.input,
              padding: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}
          />

          {importMachineryPreview && !importMachineryResult && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                padding: '12px 16px',
                background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                borderRadius: '10px', marginBottom: '10px'
              }}>
                <p style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✅ {importMachineryPreview.rows.length} row{importMachineryPreview.rows.length !== 1 ? 's' : ''} ready to import
                </p>
              </div>

              {importMachineryPreview.duplicates.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fff7ed' : 'rgba(249,115,22,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fdba74' : 'rgba(249,115,22,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: theme === 'light' ? '#9a3412' : '#fb923c', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ⚠️ {importMachineryPreview.duplicates.length} possible duplicate{importMachineryPreview.duplicates.length !== 1 ? 's' : ''} detected
                  </p>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '8px' }}>
                    These machines already exist and will be imported as additional entries:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importMachineryPreview.duplicates.map((d, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#9a3412' : '#fb923c', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        Row {d.rowIndex}: {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importMachineryPreview.invalidCategories.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef9c3' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fcd34d' : 'rgba(245,158,11,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: theme === 'light' ? '#92400e' : '#fbbf24', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ⚠️ {importMachineryPreview.invalidCategories.length} unrecognized categor{importMachineryPreview.invalidCategories.length !== 1 ? 'ies' : 'y'} found
                  </p>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '0' }}>
                    You will be prompted to map these before importing.
                  </p>
                </div>
              )}

              {importMachineryPreview.errors.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ❌ {importMachineryPreview.errors.length} row{importMachineryPreview.errors.length !== 1 ? 's' : ''} will be skipped
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importMachineryPreview.errors.map((err, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importMachineryPreview.rows.length > 0 && (
                <button
                  onClick={() => {
                    if (importMachineryPreview.invalidCategories.length > 0) {
                      setCategoryMapData(importMachineryPreview);
                      setCategoryMappings({});
                      setShowCategoryMapModal(true);
                    } else {
                      runImport('machinery', importMachineryPreview.rows, {});
                    }
                  }}
                  disabled={importingMachinery}
                  style={{
                    width: '100%', padding: '12px',
                    background: importingMachinery ? '#6b7280' : 'linear-gradient(to right, #10b981, #06b6d4)',
                    border: 'none', borderRadius: '10px', color: 'white',
                    cursor: importingMachinery ? 'not-allowed' : 'pointer',
                    fontSize: '1rem', fontWeight: '700'
                  }}
                >
                  {importingMachinery
                    ? 'Importing...'
                    : importMachineryPreview.invalidCategories.length > 0
                      ? `⚠️ Review Categories & Import`
                      : `⬆ Import ${importMachineryPreview.rows.length} Machine${importMachineryPreview.rows.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          )}

          {importMachineryResult && (
            <div>
              {importMachineryResult.succeeded.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem', marginBottom: '4px' }}>
                    ✅ {importMachineryResult.succeeded.length} machine{importMachineryResult.succeeded.length !== 1 ? 's' : ''} imported successfully
                  </p>
                </div>
              )}
              {importMachineryResult.failed.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.875rem', marginBottom: '8px' }}>
                    ❌ {importMachineryResult.failed.length} machine{importMachineryResult.failed.length !== 1 ? 's' : ''} failed
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importMachineryResult.failed.map((f, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {f.name}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => {
                  setImportMachineryPreview(null);
                  setImportMachineryResult(null);
                }}
                style={{
                  padding: '10px 20px', background: '#4b5563', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                Import Another File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>

{/* ── IMPORT SERVICE RECORDS ── */}
<div style={{
  border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <button
    onClick={() => {
      setImportServiceOpen(o => !o);
      setImportServiceResult(null);
      setImportServicePreview(null);
    }}
    style={{
      width: '100%', padding: '14px 18px',
      background: importServiceOpen
        ? (theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.15)')
        : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.04)'),
      border: 'none', cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: currentTheme.text, fontSize: '1rem', fontWeight: '600',
    }}
  >
    <span>📥 Import Service Records</span>
    <span style={{
      transition: 'transform 0.2s ease',
      transform: importServiceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      display: 'inline-block'
    }}>▼</span>
  </button>

  {importServiceOpen && (
    <div style={{ padding: '16px', borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['upload', 'template'].map(tab => (
          <button key={tab} onClick={() => setImportServiceTab(tab)} style={{
            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: importServiceTab === tab ? '700' : '400',
            background: importServiceTab === tab
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : (theme === 'light' ? '#e5e7eb' : '#374151'),
            color: importServiceTab === tab ? 'white' : currentTheme.text,
          }}>
            {tab === 'upload' ? '⬆ Upload CSV' : '📄 Download Template'}
          </button>
        ))}
      </div>

      {importServiceTab === 'template' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '8px' }}>
            Download a blank CSV template with the correct column headers and an example row.
          </p>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '8px' }}>
            Columns: <strong style={{ color: currentTheme.text }}>Machine, Service Type, Date, Technician, Notes</strong>
          </p>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '16px' }}>
            Date format: <strong style={{ color: currentTheme.text }}>YYYY-MM-DD</strong> (e.g. 2025-01-15)
          </p>
          <button
            onClick={() => downloadTemplate('service')}
            style={{
              padding: '10px 20px', background: '#0891b2', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: '600'
            }}
          >
            ⬇ Download Template
          </button>
        </div>
      )}

      {importServiceTab === 'upload' && (
        <div>
          <p style={{ color: currentTheme.textSecondary, fontSize: '0.875rem', marginBottom: '12px' }}>
            Upload a CSV file to import service records. Use the Template tab to get the correct format.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setImportServiceResult(null);
              const text = await file.text();
              const parsed = parseImportCSV(text, 'service');
              setImportServicePreview(parsed);
              e.target.value = '';
            }}
            style={{
              ...styles.input,
              padding: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}
          />

          {importServicePreview && !importServiceResult && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                padding: '12px 16px',
                background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                borderRadius: '10px', marginBottom: '10px'
              }}>
                <p style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px', fontSize: '0.9rem' }}>
                  ✅ {importServicePreview.rows.length} row{importServicePreview.rows.length !== 1 ? 's' : ''} ready to import
                </p>
              </div>

              {importServicePreview.duplicates.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fff7ed' : 'rgba(249,115,22,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fdba74' : 'rgba(249,115,22,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: theme === 'light' ? '#9a3412' : '#fb923c', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ⚠️ {importServicePreview.duplicates.length} possible duplicate{importServicePreview.duplicates.length !== 1 ? 's' : ''} detected
                  </p>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '0.8rem', marginBottom: '8px' }}>
                    These records already exist and will be imported as additional entries:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importServicePreview.duplicates.map((d, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#9a3412' : '#fb923c', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        Row {d.rowIndex}: {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importServicePreview.errors.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', marginBottom: '8px', fontSize: '0.875rem' }}>
                    ❌ {importServicePreview.errors.length} row{importServicePreview.errors.length !== 1 ? 's' : ''} will be skipped
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importServicePreview.errors.map((err, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importServicePreview.rows.length > 0 && (
                <button
                  onClick={() => runImport('service', importServicePreview.rows)}
                  disabled={importingService}
                  style={{
                    width: '100%', padding: '12px',
                    background: importingService ? '#6b7280' : 'linear-gradient(to right, #10b981, #06b6d4)',
                    border: 'none', borderRadius: '10px', color: 'white',
                    cursor: importingService ? 'not-allowed' : 'pointer',
                    fontSize: '1rem', fontWeight: '700'
                  }}
                >
                  {importingService ? 'Importing...' : `⬆ Import ${importServicePreview.rows.length} Record${importServicePreview.rows.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          )}

          {importServiceResult && (
            <div>
              {importServiceResult.succeeded.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem', marginBottom: '4px' }}>
                    ✅ {importServiceResult.succeeded.length} record{importServiceResult.succeeded.length !== 1 ? 's' : ''} imported successfully
                  </p>
                </div>
              )}
              {importServiceResult.failed.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: theme === 'light' ? '#fef2f2' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: '10px', marginBottom: '10px'
                }}>
                  <p style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.875rem', marginBottom: '8px' }}>
                    ❌ {importServiceResult.failed.length} record{importServiceResult.failed.length !== 1 ? 's' : ''} failed
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {importServiceResult.failed.map((f, i) => (
                      <li key={i} style={{ color: theme === 'light' ? '#991b1b' : '#fca5a5', fontSize: '0.8rem', lineHeight: '1.8' }}>
                        {f.name}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => {
                  setImportServicePreview(null);
                  setImportServiceResult(null);
                }}
                style={{
                  padding: '10px 20px', background: '#4b5563', border: 'none',
                  borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                Import Another File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
<div                     
  style={{
    marginTop: '24px',
    padding: '16px',
    background: currentTheme.cardBackground,
    border: `1px solid ${currentTheme.cardBorder}`,
    borderRadius: '12px'
  }}
>
  <p style={{ 
    color: theme === 'dark' ? '#9ca3af' : '#111827', 
    fontSize: '0.875rem', 
    textAlign: 'center' 
  }}>
    AgriTrack Manager • Created by Dahlton Ag Ventures • Powered by Vercel & Supabase
          </p>
        </div>
      </div>
    </div>
  </div>
)}
            </div>
          </div>
        )}  
{activeTab === 'admin' && (
  <div>
    <div style={styles.tabHeader}>
      <h2 style={{ fontSize: '1.5rem' }}>👑 Admin Dashboard</h2>
    </div>

   {/* Admin Overview Card */}
<div style={{
  ...styles.itemCard,
  background: theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
    : '#ffffff',
  border: theme === 'dark' ? '1px solid #10b981' : '2px solid #111827',
  marginBottom: '24px'
}}>
  <div style={{ flex: 1 }}>
    <h3 style={{
      fontSize: '1.5rem',
      marginBottom: '16px',
      background: 'linear-gradient(to right, #10b981, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      Administrative Access &amp; Permissions
    </h3>
    <p style={{ 
      color: theme === 'dark' ? currentTheme.textSecondary : '#111827', 
      marginBottom: '8px', 
      fontSize: '1rem' 
    }}>
      As an administrator, you have full control over AgriTrack Manager. Below is a complete comparison of admin versus employee access across every feature in the app.
    </p>
    <p style={{ 
      color: theme === 'dark' ? currentTheme.textSecondary : '#111827', 
      fontSize: '0.875rem' 
    }}>
      Logged in as: <strong style={{ color: '#10b981' }}>{user?.email}</strong> &nbsp;|&nbsp; Role: <strong style={{ color: '#10b981', textTransform: 'capitalize' }}>{userRole}</strong>
    </p>
  </div>
</div>

    {/* Permissions Comparison Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>

     {/* Admin Permissions Card */}
<div style={{
  ...styles.itemCard,
  border: theme === 'dark' ? `1px solid ${currentTheme.cardBorder}` : '2px solid #111827'
}}>
  <div style={{ flex: 1 }}>
    <h3 style={{
      fontSize: '1.25rem',
      marginBottom: '20px',
      color: '#10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      ✅ Admin / Manager — Full Access
    </h3>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>📦 Inventory</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>Add, edit, and delete inventory items</li>
              <li>Adjust quantities with + / − buttons directly on each card</li>
              <li>Set min/max stock levels for automatic low/overstock alerts</li>
              <li>Upload, view, and remove photos per item</li>
              <li>Search by name, part number, or location — sort and paginate</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🚜 Machinery</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>Add, edit, and delete machines (deleting also removes all associated service records)</li>
              <li>Assign categories and VIN/serial numbers, upload photos</li>
              <li>Filter by category using the "Show Category Filters" toggle</li>
              <li>Click the purple Services button to jump to a machine's service history</li>
              <li>Log machine hours and kilometres per machine — the correct metric is assigned automatically by category</li>
              <li>Create hour-based or km-based service reminders per machine</li>
              <li>Mark reminders as complete or delete them from the Reminders panel</li>
              <li>Restore soft-deleted reminders via the "View Deleted" button — choose to restore fresh or keep original history</li>
              <li>Rename a machine and all connected service records, hours, km, and reminders update automatically</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🔧 Service Records</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>Add, edit, and delete service records</li>
              <li>Search machines by name, category, or VIN when creating a record</li>
              <li>Attach up to 10 photos per record — browse them in the full-screen viewer</li>
              <li>Filter records by machine (via Machinery tab) — clear filter to see all</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⏰ Service Reminders</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>Access the Reminders panel via "Show" button on the Machinery tab</li>
              <li>Log hours per machine — hours accumulate over time</li>
              <li>Create reminders with a name and hour interval (e.g., Oil Change every 50 hrs)</li>
              <li>Machines with overdue service show a red ⚠️ badge on their card</li>
              <li>Mark reminders complete to reset the hour counter from current hours</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⚙️ Settings</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>Switch between Dark and Light mode (saved per browser)</li>
              <li>View account info, user ID, and access level</li>
              <li>Send a password reset email from the Account section</li>
              <li>Manage the technician list — add, edit, or remove technicians that appear in the service record form</li>
              <li>Export inventory, machinery, or service records to CSV</li>
              <li>Import data in bulk from CSV files</li>
              <li>View real-time sync status and last sync time</li>
            </ul>
          </div>
        </div>
      </div>

    {/* Employee Permissions Card */}
<div style={{
  ...styles.itemCard,
  border: theme === 'dark' ? `1px solid ${currentTheme.cardBorder}` : '2px solid #111827'
}}>
  <div style={{ flex: 1 }}>
    <h3 style={{
      fontSize: '1.25rem',
      marginBottom: '20px',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      👁️ Employee — View Only
    </h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>📦 Inventory</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>✅ View all inventory items, quantities, locations, and part numbers</li>
              <li>✅ See low stock and overstock badges</li>
              <li>✅ Search, sort, and paginate the inventory list</li>
              <li>✅ Click photos to open the full-screen viewer</li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot add, edit, or delete items</span></li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot adjust quantities — no + / − buttons</span></li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot upload or remove photos</span></li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🚜 Machinery</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>✅ View all machines, categories, and VIN/serial numbers</li>
              <li>✅ Search, sort, filter by category, and paginate</li>
              <li>✅ Click the purple Services button to view a machine's service history</li>
              <li>✅ View the Reminders panel and machine hours and km (read only)</li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot add, edit, or delete machines</span></li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot log hours or km, or create/complete/delete reminders</span></li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🔧 Service Records</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>✅ View all service records — machine, service type, date, technician, notes</li>
              <li>✅ Search, sort by date, and paginate</li>
              <li>✅ Open the photo viewer on any record that has photos</li>
              <li>✅ Filter records by machine via the Machinery tab</li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot add, edit, or delete service records</span></li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>📅 Farm Calendar</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>✅ View notes on a 12-month calendar for 2026 on the Dashboard</li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot add, edit, or delete calendar notes</span></li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⏰ Service Reminders</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
              <li>✅ View machine hours and active reminders in the Reminders panel</li>
              <li>✅ See which machines have services due (red ⚠️ badge)</li>
              <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot log hours, create, complete, or delete reminders</span></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⚙️ Settings</h4>
            <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
           <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>No Settings tab — employees do not see it in the navigation</span></li>
            <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot import or export data</span></li>
            <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot change the app theme</span></li>
            <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot reset passwords from within the app</span></li>
            <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot manage the technician list</span></li>
            <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>Cannot write, edit, or save Farm Calendar notes</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  {/* Key Takeaway */}
<div style={{
  ...styles.itemCard,
  marginTop: '24px',
  background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#ffffff',
  border: theme === 'dark' ? '1px solid #8b5cf6' : '2px solid #111827'
}}>
  <div style={{ flex: 1 }}>
    <h3 style={{ 
      fontSize: '1.25rem', 
      marginBottom: '12px', 
      color: theme === 'dark' ? '#a78bfa' : '#111827'
    }}>
      💡 Key Takeaway
    </h3>
    <p style={{ color: currentTheme.text, lineHeight: '1.8' }}>
      <strong>Employees have read-only access</strong> across all tabs — they can view, search, and browse everything but cannot make any changes.
      As an admin, you have full create, edit, and delete control across inventory, machinery, service records, reminders, and hours tracking.
      The Settings tab and all import/export tools are admin-only and will not appear in an employee's navigation.
    </p>
  </div>
</div>
  </div>
)}
{showInventoryModal && (
  <Modal title="Add Inventory Item" theme={theme} onClose={() => {
    setShowInventoryModal(false);
    isEditingRef.current = false;
  }}>
            <input
              style={styles.input}
              placeholder="Item Name"
              value={inventoryForm.name}
              onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
            />
<input
                    style={styles.input}
                    placeholder="Part Number"
                    value={inventoryForm.partNumber}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, partNumber: e.target.value })}
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
            <input
              style={styles.input}
              type="number"
              placeholder="Quantity"
              value={inventoryForm.quantity}
              onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Location"
              value={inventoryForm.location}
              onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                style={styles.input}
                type="number"
                placeholder="Min Quantity"
                value={inventoryForm.minQuantity}
                onChange={(e) => setInventoryForm({ ...inventoryForm, minQuantity: e.target.value })}
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Max Quantity"
                value={inventoryForm.maxQuantity}
                onChange={(e) => setInventoryForm({ ...inventoryForm, maxQuantity: e.target.value })}
              />
            </div>
<div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
                📸 Upload Photo (Optional)
              </label>
            <input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (file) {
      const photoUrl = await handlePhotoUpload(file, 'inventory');
      if (photoUrl) {
        setInventoryForm({ ...inventoryForm, photoUrl });
      }
    }
    e.target.value = '';
  }}
  style={{ ...styles.input, padding: '8px' }}
/>
              {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Compressing photo...</p>}
{inventoryForm.photoUrl && (
  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
    <img 
      src={inventoryForm.photoUrl} 
      alt="Preview" 
      style={{ maxWidth: '100px', borderRadius: '8px', display: 'block' }} 
    />
    <button
      onClick={(e) => {
        e.preventDefault();
        setInventoryForm({ ...inventoryForm, photoUrl: '' });
      }}
      style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: '#ef4444',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
      title="Remove photo"
    >
      ✕
    </button>
  </div>
)}
            </div>
<div style={{ display: 'flex', gap: '12px' }}>
  <button 
    onClick={addInventoryItem} 
    style={{
      ...styles.primaryButton,
      opacity: uploadingPhoto || savingInventory ? 0.5 : 1,
      cursor: uploadingPhoto || savingInventory ? 'not-allowed' : 'pointer'
    }}
    disabled={uploadingPhoto || savingInventory}
  >
    {uploadingPhoto ? 'Uploading Photo...' : savingInventory ? (
      <>
        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '6px' }} />
        Adding Item...
      </>
    ) : 'Add Item'}
  </button>
  <button 
    onClick={() => setShowInventoryModal(false)} 
    style={{
      ...styles.secondaryButton,
      opacity: savingInventory ? 0.5 : 1,
      cursor: savingInventory ? 'not-allowed' : 'pointer'
    }}
    disabled={savingInventory}
  >
    Cancel
  </button>
</div>
          </Modal>
        )}

{showMachineryModal && (
  <Modal title="Add Machinery" theme={theme} onClose={() => {
  setShowMachineryModal(false);
  isEditingRef.current = false;
}}>
            <input
              style={styles.input}
              placeholder="Machine Name"
              value={machineryForm.name}
              onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="VIN / Serial Number"
              value={machineryForm.vinSerial}
              onChange={(e) => setMachineryForm({ ...machineryForm, vinSerial: e.target.value })}
            />
        <select
  style={{...styles.input, position: 'relative', zIndex: 9999}}
  value={machineryForm.category}
  onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
>
  <option value="">Select Category...</option>
  <option value="Attachments">Attachments</option>
  <option value="Augers and Conveyors">Augers and Conveyors</option>
  <option value="Bikes and Small Motors">Bikes and Small Motors</option>
  <option value="Bulldozer Blades">Bulldozer Blades</option>
  <option value="Cars and Trucks">Cars and Trucks</option>
  <option value="Combines">Combines</option>
  <option value="Dryers">Dryers</option>
  <option value="Grain Handling">Grain Handling</option>
  <option value="Harvest Equipment">Harvest Equipment</option>
  <option value="Heavy Trucks">Heavy Trucks</option>
  <option value="Land Improvement Equipment">Land Improvement Equipment</option>
  <option value="Landscape Equipment">Landscape Equipment</option>
  <option value="Lifts &amp; Cranes">Lifts &amp; Cranes</option>
  <option value="Other">Other</option>
  <option value="Spreaders">Spreaders</option>
  <option value="Spraying">Spraying</option>
  <option value="Straight Cut/Pick-Up Headers">Straight Cut/Pick-Up Headers</option>
  <option value="Tillage and Seeding">Tillage and Seeding</option>
  <option value="Tractors">Tractors</option>
  <option value="Trailers">Trailers</option>
</select>
<select
  style={{...styles.input, position: 'relative', zIndex: 9998}}
  value={machineryForm.tracking_type || ''}
  onChange={(e) => setMachineryForm({ ...machineryForm, tracking_type: e.target.value })}
>
  <option value="">Tracking type — use category default</option>
  <option value="hours">Hours</option>
  <option value="km">km</option>
  <option value="none">None</option>
</select>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
                📸 Upload Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const photoUrl = await handlePhotoUpload(file, 'machinery');
                    if (photoUrl) {
                      setMachineryForm({ ...machineryForm, photoUrl });
                    }
                  }
                 e.target.value = ''; 
                }}
                style={{ ...styles.input, padding: '8px' }}
              />
              {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
{machineryForm.photoUrl && (
  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
    <img 
      src={machineryForm.photoUrl} 
      alt="Preview" 
      style={{ maxWidth: '100px', borderRadius: '8px', display: 'block' }} 
    />
    <button
      onClick={() => setMachineryForm({ ...machineryForm, photoUrl: '' })}
      style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: '#ef4444',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}
      title="Remove photo"
    >
      ✕
    </button>
  </div>
)}
            </div>
           <div style={{ display: 'flex', gap: '12px' }}>
  <button 
    onClick={addMachineryItem} 
    style={{
      ...styles.primaryButton,
      opacity: uploadingPhoto ? 0.5 : 1,
      cursor: uploadingPhoto ? 'not-allowed' : 'pointer'
    }}
    disabled={uploadingPhoto}
  >
    {uploadingPhoto ? 'Uploading Photo...' : 'Add Machine'}
  </button>
  <button onClick={() => setShowMachineryModal(false)} style={styles.secondaryButton}>Cancel</button>
</div>
          </Modal>
        )}

{showServiceModal && (
<Modal title="Add Service Record" theme={theme} onClose={() => {
  setShowServiceModal(false);
  setMachineSearchModal('');
  setMachineDropdownOpen(false);
  isEditingRef.current = false;
}}>
   <div style={{ marginBottom: '16px', position: 'relative' }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
        Select Machine
      </label>
      <input
        type="text"
        placeholder="🔍 Search or select a machine..."
        value={serviceForm.machineName || machineSearchModal}
        onChange={(e) => {
          setMachineSearchModal(e.target.value);
          setServiceForm({ ...serviceForm, machineName: '' });
          setMachineDropdownOpen(true);
        }}
        onFocus={() => setMachineDropdownOpen(true)}
        onBlur={() => setTimeout(() => setMachineDropdownOpen(false), 150)}
        style={{
          ...styles.input,
          marginBottom: 0,
          backgroundColor: serviceForm.machineName ? (theme === 'light' ? '#f0fdf4' : '#1a3a2a') : styles.input.background,
          borderColor: serviceForm.machineName ? '#10b981' : styles.input.borderColor,
        }}
      />
      {serviceForm.machineName && (
        <button
          onClick={() => {
            setServiceForm({ ...serviceForm, machineName: '' });
            setMachineSearchModal('');
          }}
          style={{
            position: 'absolute',
            right: '10px',
            top: '30px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '4px'
          }}
        >✕</button>
      )}
      {machineDropdownOpen && !serviceForm.machineName && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: theme === 'light' ? '#ffffff' : '#1e3a5f',
          border: `1px solid ${theme === 'light' ? '#bfdbfe' : '#2563eb'}`,
          borderRadius: '8px',
          zIndex: 1000,
          maxHeight: '220px',
          overflowY: 'auto',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          marginTop: '4px'
        }}>
          {machinery
            .filter(machine => {
              const searchLower = machineSearchModal.toLowerCase();
              return !searchLower || (
                machine.name?.toLowerCase().includes(searchLower) ||
                machine.category?.toLowerCase().includes(searchLower) ||
                machine.vinSerial?.toLowerCase().includes(searchLower)
              );
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .map(machine => (
              <div
                key={machine.id}
                onMouseDown={() => {
                  setServiceForm({ ...serviceForm, machineName: machine.name });
                  setMachineSearchModal('');
                  setMachineDropdownOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: theme === 'light' ? '#111827' : 'white',
                  borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2d4a6b'}`,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? '#eff6ff' : '#2d4a6b'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {machine.name}
                {machine.category && <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}> — {machine.category}</span>}
              </div>
            ))}
          {machinery.filter(m => {
            const s = machineSearchModal.toLowerCase();
            return !s || m.name?.toLowerCase().includes(s) || m.category?.toLowerCase().includes(s) || m.vinSerial?.toLowerCase().includes(s);
          }).length === 0 && (
            <div style={{ padding: '12px 14px', color: '#9ca3af', fontSize: '0.875rem' }}>
              No machines match your search
            </div>
          )}
        </div>
      )}
    </div>
    <input
      style={styles.input}
      placeholder="Service Type (e.g., Oil Change, Repair, Inspection)"
      value={serviceForm.serviceType}
      onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
    />
<div style={{ position: 'relative', marginBottom: '16px' }}>
  <input
    style={{ ...styles.input, fontFamily: 'inherit', width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginBottom: 0, position: 'relative', display: 'block', WebkitAppearance: 'none', appearance: 'none', height: '48px' }}
    type="date"
    value={serviceForm.date}
    onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
  />
</div>
<TechnicianField
      value={serviceForm.technician}
      onChange={(val) => setServiceForm({ ...serviceForm, technician: val })}
      styles={styles}
      technicians={technicians}
    />
    <textarea
  style={{ ...styles.input, minHeight: '100px', resize: 'vertical', fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', fontSize: '1rem', whiteSpace: 'pre-wrap', letterSpacing: 'normal' }}
  placeholder="Service notes and details..."
      value={serviceForm.notes}
      onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
    />
<div style={{ marginBottom: '16px' }}>
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
    📸 Upload Photos (up to 10)
  </label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      const currentCount = serviceForm.photoUrls.length;
      const remainingSlots = 10 - currentCount;
      
      if (remainingSlots === 0) {
        alert('Maximum 10 photos allowed');
        e.target.value = '';
        return;
      }
      
      const filesToUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        alert(`Only uploading ${remainingSlots} photo(s) to stay within 10 photo limit`);
      }
      
      for (const file of filesToUpload) {
        const photoUrl = await handlePhotoUpload(file, 'service');
        if (photoUrl) {
          setServiceForm(prev => ({
            ...prev,
            photoUrls: [...prev.photoUrls, photoUrl]
          }));
        }
      }
      
      e.target.value = '';
    }}
    style={{ ...styles.input, padding: '8px' }}
    disabled={serviceForm.photoUrls.length >= 10 || uploadingPhoto}
  />
  
  {uploadingPhoto && (
    <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '8px' }}>
      Compressing photo...
    </p>
  )}
  
  {serviceForm.photoUrls.length > 0 && (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '12px',
      marginTop: '12px'
    }}>
      {serviceForm.photoUrls.map((url, index) => (
        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={url} 
            alt={`Photo ${index + 1}`}
            style={{ 
              width: '100%', 
              height: '100px', 
              objectFit: 'cover', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              border: '2px solid transparent'
            }} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setViewingImage(url);
              setImageModalTitle(`Service Photo ${index + 1}`);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setServiceForm(prev => ({
                ...prev,
                photoUrls: prev.photoUrls.filter((_, i) => i !== index)
              }));
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            title="Remove photo"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
  
  <p style={{ 
    color: '#9ca3af', 
    fontSize: '0.75rem', 
    marginTop: '8px' 
  }}>
    {serviceForm.photoUrls.length} / 10 photos
  </p>
</div>
<div style={{ display: 'flex', gap: '12px' }}>
<button 
  onClick={addServiceRecord}
  style={{
    ...styles.primaryButton,
    opacity: !serviceForm.machineName || machinery.length === 0 || savingService ? 0.5 : 1,
    cursor: !serviceForm.machineName || machinery.length === 0 || savingService ? 'not-allowed' : 'pointer'
  }}
  disabled={!serviceForm.machineName || machinery.length === 0 || savingService}
>
  {savingService ? 'Saving...' : 'Add Record'}
</button>
      <button onClick={() => setShowServiceModal(false)} style={styles.secondaryButton}>Cancel</button>
    </div>
  </Modal>
)}
     
      {showDebugModal && (
  <Modal title="System Status" theme={theme} onClose={() => setShowDebugModal(false)}>
            <div style={styles.debugInfo}>
              <p><strong>Real-time Status:</strong> {realtimeStatus}</p>
              <p><strong>Last Sync:</strong> {lastSync?.toLocaleString() || 'Never'}</p>
              <p><strong>Inventory Items:</strong> {inventory.length}</p>
              <p><strong>Machines:</strong> {machinery.length}</p>
              <p><strong>Logged in as:</strong> {user?.email}</p>
            </div>
            <button onClick={() => window.location.reload()} style={styles.primaryButton}>
              🔄 Refresh App
            </button>
          </Modal>
        )}

{showKmDetailModal && selectedKmRecord && (
  <Modal title={selectedKmRecord.machine.name} theme={theme} onClose={() => setShowKmDetailModal(false)}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Current Kilometres</p>
      <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0891b2' }}>
        {getMachineKm(selectedKmRecord.machine.name).toFixed(1)} km
      </p>
    </div>
    {editingKm ? (
      <div>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
          Set total km to:
        </label>
        <input
          type="number"
          step="0.1"
          value={newTotalKm}
          onChange={(e) => setNewTotalKm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a2942',
            border: '1px solid #2563eb',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1rem',
            marginBottom: '16px',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={saveKmEdit}
            style={{
              flex: 1,
              padding: '12px',
              background: '#0891b2',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Save
          </button>
          <button
            onClick={() => setEditingKm(false)}
            style={{
              flex: 1,
              padding: '12px',
              background: '#4b5563',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {userRole !== 'employee' && (
          <>
            <button
              onClick={() => setEditingKm(true)}
              style={{
                padding: '12px',
                background: '#0891b2',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ✏️ Edit Kilometres
            </button>
            {selectedKmRecord.record && (
              <button
                onClick={deleteKmRecord}
                style={{
                  padding: '12px',
                  background: '#7f1d1d',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🗑️ Delete km Record
              </button>
            )}
          </>
        )}
        <button
          onClick={() => setShowKmDetailModal(false)}
          style={{
            padding: '12px',
            background: '#4b5563',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Close
        </button>
      </div>
    )}
  </Modal>
)}      

{showKmReminderModal && (
  <Modal title="Create km Service Reminder" theme={theme} onClose={() => {
    setShowKmReminderModal(false);
    setSelectedMachineForReminder('');
    setReminderForm({ reminderName: '', hoursInterval: '', kmInterval: '' });
  }}>
    <select
      style={styles.input}
      value={selectedMachineForReminder}
      onChange={(e) => setSelectedMachineForReminder(e.target.value)}
    >
     <option value="">-- Select Machine --</option>
{machinery.filter(m => {
  const t = CATEGORY_TRACKING_TYPE[m.category] || 'hours';
  return t === 'km' || t === 'both';
}).map(machine => (
  <option key={machine.id} value={machine.name}>
    {machine.name} (Current: {getMachineKm(machine.name).toFixed(1)} km)
  </option>
))}
    </select>
    <input
      style={styles.input}
      placeholder="Reminder name (e.g., Oil Change)"
      value={reminderForm.reminderName}
      onChange={(e) => setReminderForm({ ...reminderForm, reminderName: e.target.value })}
    />
    <input
      style={styles.input}
      type="number"
      step="1"
      placeholder="km interval (e.g., 5000)"
      value={reminderForm.kmInterval || ''}
      onChange={(e) => setReminderForm({ ...reminderForm, kmInterval: e.target.value })}
    />
    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        onClick={createKmReminder}
        style={{
          ...styles.primaryButton,
          background: '#0891b2'
        }}
      >
        Create Reminder
      </button>
      <button
        onClick={() => setShowKmReminderModal(false)}
        style={styles.secondaryButton}
      >
        Cancel
      </button>
    </div>
  </Modal>
)}
      
{/* Hours Detail Modal */}
{showHoursDetailModal && selectedHoursRecord && (
  <Modal title={selectedHoursRecord.machine.name} theme={theme} onClose={() => setShowHoursDetailModal(false)}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '8px' }}>Current Hours</p>
      <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>
        {getMachineHours(selectedHoursRecord.machine.name).toFixed(1)} hrs
      </p>
    </div>

    {editingHours ? (
      <div>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
          Set total hours to:
        </label>
        <input
          type="number"
          step="0.1"
          value={newTotalHours}
          onChange={(e) => setNewTotalHours(e.target.value)}
          style={{ width: '100%', padding: '12px', background: '#1a2942', border: '1px solid #2563eb', borderRadius: '8px', color: 'white', fontSize: '1rem', marginBottom: '16px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={saveHoursEdit} style={{ flex: 1, padding: '12px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
            Save
          </button>
          <button onClick={() => setEditingHours(false)} style={{ flex: 1, padding: '12px', background: '#4b5563', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {userRole !== 'employee' && (
          <>
            <button onClick={() => setEditingHours(true)} style={{ padding: '12px', background: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              ✏️ Edit Hours
            </button>
            {selectedHoursRecord.record && (
              <button onClick={deleteHoursRecord} style={{ padding: '12px', background: '#7f1d1d', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🗑️ Delete Hours Record
              </button>
            )}
          </>
        )}
        <button onClick={() => setShowHoursDetailModal(false)} style={{ padding: '12px', background: '#4b5563', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
          Close
        </button>
      </div>
    )}
  </Modal>
)}
      
{/* Create Reminder Modal */}
{showReminderModal && (
  <Modal title="Create Service Reminder" theme={theme} onClose={() => {
    setShowReminderModal(false);
    setSelectedMachineForReminder('');
    setReminderForm({ reminderName: '', hoursInterval: '' });
  }}>
    <select
      style={styles.input}
      value={selectedMachineForReminder}
      onChange={(e) => setSelectedMachineForReminder(e.target.value)}
    >
      <option value="">-- Select Machine --</option>
{machinery.filter(m => {
  const t = CATEGORY_TRACKING_TYPE[m.category] || 'hours';
  return t === 'hours' || t === 'both';
}).map(machine => (
  <option key={machine.id} value={machine.name}>
    {machine.name} (Current: {getMachineHours(machine.name).toFixed(1)} hrs)
  </option>
))}
    </select>
    <input
      style={styles.input}
      placeholder="Reminder name (e.g., Oil Change)"
      value={reminderForm.reminderName}
      onChange={(e) => setReminderForm({ ...reminderForm, reminderName: e.target.value })}
    />
    <input
      style={styles.input}
      type="number"
      step="1"
      placeholder="Hours interval (e.g., 50)"
      value={reminderForm.hoursInterval}
      onChange={(e) => setReminderForm({ ...reminderForm, hoursInterval: e.target.value })}
    />
    <div style={{ display: 'flex', gap: '12px' }}>
      <button onClick={createReminder} style={styles.primaryButton}>
        Create Reminder
      </button>
      <button onClick={() => setShowReminderModal(false)} style={styles.secondaryButton}>
        Cancel
      </button>
    </div>
  </Modal>
)}

{/* Deleted Reminders Modal */}
{showDeletedRemindersModal && (
  <Modal
    title="🗑️ Deleted Reminders"
    theme={theme}
    onClose={() => setShowDeletedRemindersModal(false)}
  >
    {deletedReminders.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🗑️</p>
        <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
          No deleted reminders found
        </p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
          {deletedReminders.length} deleted reminder{deletedReminders.length !== 1 ? 's' : ''} found. Restore any to bring them back.
        </p>
        {deletedReminders.map(reminder => (
          <div key={reminder.id} style={{
            padding: '16px',
            background: theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px', color: theme === 'light' ? '#111827' : 'white' }}>
                  {reminder.machine_name}
                </p>
                <p style={{ color: reminder.reminder_type === 'km' ? '#0891b2' : '#10b981', fontSize: '0.875rem', marginBottom: '8px' }}>
                  {reminder.reminder_name}
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Type</p>
                    <p style={{ fontSize: '0.85rem', color: theme === 'light' ? '#111827' : 'white' }}>
                      {reminder.reminder_type === 'km' ? '🛣️ Kilometres' : '⏱️ Hours'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Interval</p>
                    <p style={{ fontSize: '0.85rem', color: theme === 'light' ? '#111827' : 'white' }}>
                      Every {reminder.reminder_type === 'km' ? `${reminder.km_interval} km` : `${reminder.hours_interval} hrs`}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Deleted</p>
                    <p style={{ fontSize: '0.85rem', color: theme === 'light' ? '#111827' : 'white' }}>
                      {new Date(reminder.deleted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
<button
  onClick={() => restoreReminder(reminder.id)}
  disabled={restoringReminder === reminder.id}
    style={{
      padding: '10px 16px',
      background: restoringReminder === reminder.id ? '#6b7280' : 'linear-gradient(to right, #10b981, #06b6d4)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: restoringReminder === reminder.id ? 'not-allowed' : 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}
  >
    {restoringReminder === reminder.id ? '...' : '↺ Restore'}
  </button>
  <button
    onClick={async () => {
      if (!confirm(`Permanently delete "${reminder.reminder_name}" for ${reminder.machine_name}? This cannot be undone.`)) return;
      try {
        const { error } = await supabase.from('service_reminders').delete().eq('id', reminder.id);
        if (error) { alert('Failed to delete: ' + error.message); return; }
        setDeletedReminders(prev => prev.filter(r => r.id !== reminder.id));
      } catch (error) {
        alert('Failed to delete reminder');
      }
    }}
    disabled={restoringReminder === reminder.id}
    style={{
      padding: '10px 16px',
      background: restoringReminder === reminder.id ? '#6b7280' : '#7f1d1d',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: restoringReminder === reminder.id ? 'not-allowed' : 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}
  >
    🗑️ Delete
  </button>
</div>
            </div>
          </div>
        ))}
      </div>
    )}

  </Modal>
)}
      
{/* Complete Reminder Modal */}
{showCompleteReminderModal && completingReminder && (
  <Modal
    title={`Complete — ${completingReminder.reminder_name}`}
    theme={theme}
    onClose={() => {
      setShowCompleteReminderModal(false);
      setCompletingReminder(null);
    }}
  >
    {/* Summary bar */}
    <div style={{
      padding: '16px',
      background: completingReminder.reminder_type === 'km'
        ? 'rgba(8, 145, 178, 0.15)'
        : 'rgba(16, 185, 129, 0.15)',
      border: `1px solid ${completingReminder.reminder_type === 'km' ? '#0891b2' : '#10b981'}`,
      borderRadius: '10px',
      marginBottom: '20px',
    }}>
      <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px', color: theme === 'light' ? '#111827' : 'white' }}>
        {completingReminder.machine_name}
      </p>
      <p style={{ color: theme === 'light' ? '#374151' : '#9ca3af', fontSize: '0.875rem' }}>
        {completingReminder.reminder_type === 'km'
          ? `Current: ${completingReminder.currentKm?.toFixed(1)} km`
          : `Current: ${completingReminder.currentHours?.toFixed(1)} hrs`}
        &nbsp;·&nbsp;
        Interval: every {completingReminder.reminder_type === 'km'
          ? `${completingReminder.km_interval} km`
          : `${completingReminder.hours_interval} hrs`}
      </p>
    </div>

    {/* Question */}
    {completeServiceForm.logService === null && (
      <>
        <p style={{
          fontSize: '1.05rem',
          fontWeight: '600',
          marginBottom: '20px',
          color: theme === 'light' ? '#111827' : 'white',
          textAlign: 'center'
        }}>
          Would you like to log this service in the history?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => setCompleteServiceForm(prev => ({ ...prev, logService: true }))}
            style={{
              padding: '16px',
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            📋 Yes — log it in service history
          </button>
          <button
            onClick={() => handleCompleteReminderSubmit(false)}
            style={{
              padding: '16px',
              background: theme === 'light' ? '#f3f4f6' : '#374151',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '10px',
              color: theme === 'light' ? '#374151' : '#d1d5db',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✓ Just mark complete
          </button>
        </div>
      </>
    )}

    {/* Service log form */}
    {completeServiceForm.logService === true && (
      <>
        <p style={{
          fontSize: '0.875rem',
          color: theme === 'light' ? '#374151' : '#9ca3af',
          marginBottom: '16px'
        }}>
          Fill in the details below. Machine name and service type are pre-filled from the reminder.
        </p>

        {/* Machine name — read only */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
            Machine
          </label>
          <div style={{
            padding: '10px 14px',
            background: theme === 'light' ? '#f3f4f6' : '#1a2942',
            border: `1px solid ${theme === 'light' ? '#d1d5db' : '#374151'}`,
            borderRadius: '8px',
            color: theme === 'light' ? '#374151' : '#9ca3af',
            fontSize: '0.95rem'
          }}>
            {completingReminder.machine_name}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
            Service Type
          </label>
          <input
            style={{
              ...styles.input,
              marginBottom: 0
            }}
            value={completeServiceForm.serviceType}
            onChange={e => setCompleteServiceForm(prev => ({ ...prev, serviceType: e.target.value }))}
            placeholder="e.g. Oil Change, Filter Replacement"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
            Date
          </label>
          <input
            type="date"
            style={{
              ...styles.input,
              marginBottom: 0,
              fontFamily: 'inherit'
            }}
            value={completeServiceForm.date}
            onChange={e => setCompleteServiceForm(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
            Technician
          </label>
<TechnicianField
            value={completeServiceForm.technician}
            onChange={(val) => setCompleteServiceForm(prev => ({ ...prev, technician: val }))}
            styles={styles}
            technicians={technicians}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '4px' }}>
            Notes
          </label>
          <textarea
            style={{
              ...styles.input,
              marginBottom: 0,
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
              fontSize: '1rem'
            }}
            value={completeServiceForm.notes}
            onChange={e => setCompleteServiceForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="What was done? Parts used? Anything to note for next time?"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleCompleteReminderSubmit(true)}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✓ Save & Complete
          </button>
          <button
            onClick={() => setCompleteServiceForm(prev => ({ ...prev, logService: null }))}
            style={{
              padding: '14px 20px',
              background: theme === 'light' ? '#f3f4f6' : '#374151',
              border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
              borderRadius: '10px',
              color: theme === 'light' ? '#374151' : '#d1d5db',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back
          </button>
        </div>
      </>
    )}
  </Modal>
)}      

{showCategoryMapModal && categoryMapData && (
  <Modal
    title="⚠️ Unrecognized Categories"
    theme={theme}
    onClose={() => {
      setShowCategoryMapModal(false);
      setCategoryMapData(null);
      setCategoryMappings({});
    }}
  >
    <p style={{
      color: theme === 'light' ? '#374151' : '#9ca3af',
      fontSize: '0.875rem',
      marginBottom: '16px',
      lineHeight: '1.6'
    }}>
      The following categories were not recognized. For each one, either map it to an existing category or leave it as-is to import with the original value.
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      {categoryMapData.invalidCategories.map(unknownCat => (
        <div key={unknownCat} style={{
          padding: '14px 16px',
          background: theme === 'light' ? '#fef9c3' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${theme === 'light' ? '#fcd34d' : 'rgba(245, 158, 11, 0.4)'}`,
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span style={{
              fontWeight: '700',
              color: theme === 'light' ? '#92400e' : '#fbbf24',
              fontSize: '0.95rem'
            }}>
              "{unknownCat}"
            </span>
            <span style={{
              color: theme === 'light' ? '#6b7280' : '#9ca3af',
              fontSize: '0.8rem'
            }}>
              — not in category list
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{
              color: theme === 'light' ? '#374151' : '#9ca3af',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap'
            }}>
              Map to:
            </label>
            <select
              value={categoryMappings[unknownCat] || ''}
              onChange={(e) => setCategoryMappings(prev => ({
                ...prev,
                [unknownCat]: e.target.value
              }))}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: theme === 'light' ? '#ffffff' : '#1a2942',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#2563eb'}`,
                borderRadius: '8px',
                color: theme === 'light' ? '#111827' : 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '180px'
              }}
            >
              <option value="">— Keep original value —</option>
              {MACHINERY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {categoryMappings[unknownCat] && (
            <p style={{
              color: '#10b981',
              fontSize: '0.75rem',
              marginTop: '8px',
              marginBottom: 0
            }}>
              ✓ Will be imported as "{categoryMappings[unknownCat]}"
            </p>
          )}
          {!categoryMappings[unknownCat] && (
            <p style={{
              color: theme === 'light' ? '#92400e' : '#fbbf24',
              fontSize: '0.75rem',
              marginTop: '8px',
              marginBottom: 0
            }}>
              Will be imported as-is: "{unknownCat}"
            </p>
          )}
        </div>
      ))}
    </div>

    {/* Duplicate warning if any */}
    {categoryMapData.duplicates.length > 0 && (
      <div style={{
        padding: '12px 16px',
        background: theme === 'light' ? '#fff7ed' : 'rgba(249, 115, 22, 0.1)',
        border: `1px solid ${theme === 'light' ? '#fdba74' : 'rgba(249, 115, 22, 0.4)'}`,
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <p style={{
          fontWeight: '700',
          color: theme === 'light' ? '#9a3412' : '#fb923c',
          fontSize: '0.875rem',
          marginBottom: '8px'
        }}>
          ⚠️ {categoryMapData.duplicates.length} duplicate{categoryMapData.duplicates.length !== 1 ? 's' : ''} detected
        </p>
        <p style={{
          color: theme === 'light' ? '#7c2d12' : '#9ca3af',
          fontSize: '0.8rem',
          marginBottom: '8px'
        }}>
          These machines already exist and will be imported as additional entries:
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          {categoryMapData.duplicates.map((d, i) => (
            <li key={i} style={{
              color: theme === 'light' ? '#7c2d12' : '#fb923c',
              fontSize: '0.8rem',
              lineHeight: '1.8'
            }}>
              Row {d.rowIndex}: {d.name}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Parse errors if any */}
    {categoryMapData.errors && categoryMapData.errors.length > 0 && (
      <div style={{
        padding: '12px 16px',
        background: theme === 'light' ? '#fef2f2' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${theme === 'light' ? '#fca5a5' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <p style={{
          fontWeight: '700',
          color: '#ef4444',
          fontSize: '0.875rem',
          marginBottom: '8px'
        }}>
          ❌ {categoryMapData.errors.length} row{categoryMapData.errors.length !== 1 ? 's' : ''} will be skipped
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          {categoryMapData.errors.map((e, i) => (
            <li key={i} style={{
              color: theme === 'light' ? '#991b1b' : '#fca5a5',
              fontSize: '0.8rem',
              lineHeight: '1.8'
            }}>
              {e}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        onClick={() => {
          setShowCategoryMapModal(false);
          runImport('machinery', categoryMapData.rows, categoryMappings);
          setCategoryMapData(null);
          setCategoryMappings({});
        }}
        style={{
          flex: 1,
          padding: '14px',
          background: 'linear-gradient(to right, #10b981, #06b6d4)',
          border: 'none',
          borderRadius: '10px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '700'
        }}
      >
        ✓ Confirm & Import {categoryMapData.rows.length} Row{categoryMapData.rows.length !== 1 ? 's' : ''}
      </button>
      <button
        onClick={() => {
          setShowCategoryMapModal(false);
          setCategoryMapData(null);
          setCategoryMappings({});
        }}
        style={{
          padding: '14px 20px',
          background: theme === 'light' ? '#f3f4f6' : '#374151',
          border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
          borderRadius: '10px',
          color: theme === 'light' ? '#374151' : '#d1d5db',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Cancel
      </button>
    </div>
  </Modal>
)}
      
{showRestoreChoiceModal && pendingRestoreReminder && (() => {
  const reminder = pendingRestoreReminder;
  const isKm = reminder.reminder_type === 'km';
  const currentMetric = isKm ? getMachineKm(reminder.machine_name) : getMachineHours(reminder.machine_name);
  const lastMetric = isKm ? parseFloat(reminder.last_service_km || 0) : parseFloat(reminder.last_service_hours || 0);
  const interval = isKm ? parseFloat(reminder.km_interval || 0) : parseFloat(reminder.hours_interval || 0);
  const unit = isKm ? 'km' : 'hrs';
  const freshNextDue = currentMetric + interval;
  const originalUsed = currentMetric - lastMetric;
  const originalOverdue = originalUsed >= interval;
  const originalOverageAmt = Math.abs(interval - originalUsed).toFixed(0);
  const originalNextDue = lastMetric + interval;

  const cardStyle = (active) => ({
    padding: '16px 20px',
    background: active ? 'rgba(16, 185, 129, 0.08)' : (theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)'),
    border: active ? '2px solid #10b981' : `2px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  });

  return (
    <Modal
      title="↺ Restore Reminder"
      theme={theme}
      onClose={() => {
        setShowRestoreChoiceModal(false);
        setPendingRestoreReminder(null);
        setRestoreChoice(null);
      }}
    >
      {/* Machine info bar */}
      <div style={{
        padding: '12px 16px',
        background: isKm ? 'rgba(8,145,178,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${isKm ? '#0891b2' : '#10b981'}`,
        borderRadius: 10,
        marginBottom: 20,
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Machine</p>
          <p style={{ fontWeight: 700, color: currentTheme.text, fontSize: '0.95rem', margin: 0 }}>{reminder.machine_name}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Reminder</p>
          <p style={{ fontWeight: 700, color: currentTheme.text, fontSize: '0.95rem', margin: 0 }}>{reminder.reminder_name}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Current {isKm ? 'km' : 'Hours'}</p>
          <p style={{ fontWeight: 700, color: currentTheme.text, fontSize: '0.95rem', margin: 0 }}>{currentMetric.toFixed(1)} {unit}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Last Serviced At</p>
          <p style={{ fontWeight: 700, color: currentTheme.text, fontSize: '0.95rem', margin: 0 }}>{lastMetric.toFixed(1)} {unit}</p>
        </div>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Interval</p>
          <p style={{ fontWeight: 700, color: currentTheme.text, fontSize: '0.95rem', margin: 0 }}>Every {interval} {unit}</p>
        </div>
      </div>

      <p style={{ fontWeight: 600, fontSize: '1rem', color: currentTheme.text, marginBottom: 14 }}>
        How would you like to restore this reminder?
      </p>

      {/* Option 1 - Fresh Start */}
      <div style={cardStyle(restoreChoice === 'fresh')} onClick={() => setRestoreChoice('fresh')}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: restoreChoice === 'fresh' ? '#10b981' : (theme === 'light' ? '#e5e7eb' : '#374151'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0, transition: 'background 0.2s ease',
        }}>🔄</div>
        <div>
          <p style={{ fontWeight: 700, color: currentTheme.text, margin: 0, marginBottom: 4, fontSize: '0.95rem' }}>
            Fresh Start
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
            Reset from <strong style={{ color: currentTheme.text }}>current {isKm ? 'km' : 'hours'} ({currentMetric.toFixed(1)} {unit})</strong>. Next service due at {freshNextDue.toFixed(0)} {unit}.
          </p>
        </div>
      </div>

      <div style={{ height: 10 }} />

      {/* Option 2 - Keep Original */}
      <div style={cardStyle(restoreChoice === 'original')} onClick={() => setRestoreChoice('original')}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: restoreChoice === 'original' ? '#10b981' : (theme === 'light' ? '#e5e7eb' : '#374151'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0, transition: 'background 0.2s ease',
        }}>📋</div>
        <div>
          <p style={{ fontWeight: 700, color: currentTheme.text, margin: 0, marginBottom: 4, fontSize: '0.95rem' }}>
            Keep Original History
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
            Restore from <strong style={{ color: currentTheme.text }}>last service ({lastMetric.toFixed(1)} {unit})</strong>.{' '}
            {originalOverdue
              ? <span>Currently <strong style={{ color: '#ef4444' }}>{originalOverageAmt} {unit} overdue</strong> — was due at {originalNextDue.toFixed(0)} {unit}.</span>
              : <span>Next service due at {originalNextDue.toFixed(0)} {unit}.</span>
            }
          </p>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={confirmRestoreReminder}
        disabled={!restoreChoice || restoringReminder === reminder.id}
        style={{
          width: '100%',
          marginTop: 20,
          padding: '14px',
          background: restoreChoice ? 'linear-gradient(to right, #10b981, #06b6d4)' : '#6b7280',
          border: 'none',
          borderRadius: 10,
          color: 'white',
          cursor: restoreChoice ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: 700,
          opacity: restoringReminder === reminder.id ? 0.7 : 1,
        }}
      >
        {restoringReminder === reminder.id
          ? 'Restoring...'
          : restoreChoice === 'fresh'
            ? '🔄 Restore with Fresh Start'
            : restoreChoice === 'original'
              ? '📋 Restore with Original History'
              : 'Select an option above'}
      </button>
    </Modal>
  );
})()}
      
{/* Zoomable Image Viewer Modal */}
      {viewingImage && <ZoomableImageViewer 
  imageUrl={viewingImage} 
  title={imageModalTitle} 
  onClose={() => {
    setViewingImage(null);
    setViewingImageArray([]);
    setViewingImageIndex(0);
  }}
theme={currentTheme}
  allPhotos={viewingImageArray}
  startIndex={viewingImageIndex}
  isDesktop={isDesktop}
/>
}
      </div>
    </div>
  </>
  );
}

function DashboardPanels({
  theme, isDesktop, serviceReminders, machineHours, machineKm, onReminderClick,
  calendarNotes, calendarSelectedKey, setCalendarSelectedKey,
  calendarNoteText, setCalendarNoteText, calendarNoteDirty, setCalendarNoteDirty,
  calendarSaving, calendarSaved, onSave, userRole
}) {
  const [mobileTab, setMobileTab] = React.useState('service');

const calendarProps = {
    theme, isDesktop, calendarNotes, calendarSelectedKey, setCalendarSelectedKey,
    calendarNoteText, setCalendarNoteText, calendarNoteDirty, setCalendarNoteDirty,
    calendarSaving, calendarSaved, onSave, userRole
  };

  const servicePanel = (
    <ServiceOverview
      serviceReminders={serviceReminders}
      machineHours={machineHours}
      machineKm={machineKm}
      theme={theme}
      onReminderClick={onReminderClick}
    />
  );

  const calendarPanel = <FarmCalendar {...calendarProps} />;

  if (isDesktop) {
    return (
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div style={{ flex: '0 0 58%', maxWidth: '58%' }}>
          {servicePanel}
        </div>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {calendarPanel}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        borderRadius: '10px',
        overflow: 'hidden',
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2563eb'}`,
        marginBottom: '12px',
      }}>
        <button
          onClick={() => setMobileTab('service')}
          style={{
            flex: 1,
            padding: '11px 8px',
            border: 'none',
            background: mobileTab === 'service'
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : (theme === 'light' ? '#f9fafb' : '#1e3a5f'),
            color: mobileTab === 'service'
              ? 'white'
              : (theme === 'light' ? '#374151' : '#9ca3af'),
            fontWeight: mobileTab === 'service' ? '700' : '400',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🔧 Service
        </button>
        <button
          onClick={() => setMobileTab('calendar')}
          style={{
            flex: 1,
            padding: '11px 8px',
            border: 'none',
            borderLeft: `1px solid ${theme === 'light' ? '#e5e7eb' : '#2563eb'}`,
            background: mobileTab === 'calendar'
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : (theme === 'light' ? '#f9fafb' : '#1e3a5f'),
            color: mobileTab === 'calendar'
              ? 'white'
              : (theme === 'light' ? '#374151' : '#9ca3af'),
            fontWeight: mobileTab === 'calendar' ? '700' : '400',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          📅 Calendar
        </button>
      </div>
      {mobileTab === 'service' ? servicePanel : calendarPanel}
    </div>
  );
}

function FarmCalendar({ theme, isDesktop, calendarNotes, calendarSelectedKey, setCalendarSelectedKey, calendarNoteText, setCalendarNoteText, calendarNoteDirty, setCalendarNoteDirty, calendarSaving, calendarSaved, onSave, userRole }) {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const today = new Date();
  const editorRef = React.useRef(null);
  const [expandedMonth, setExpandedMonth] = React.useState(null);
  const [view, setView] = React.useState('grid');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState({ bold: false, italic: false, underline: false, strikeThrough: false });
  const activeFormatsRef = React.useRef({ bold: false, italic: false, underline: false, strikeThrough: false });
  const savedSelectionRef = React.useRef(null);
  const fontSizeSelectRef = React.useRef(null);
  const [currentFontSize, setCurrentFontSize] = React.useState('');
  const emojiPickerRef = React.useRef(null);

 React.useEffect(() => {
    function handleClickOutside(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cardBg     = theme === 'light' ? '#ffffff' : '#1e3a5f';
  const cardBorder = theme === 'light' ? '#e5e7eb' : '#2563eb';
  const textMain   = theme === 'light' ? '#111827' : '#ffffff';
  const textSub    = theme === 'light' ? '#6b7280' : '#9ca3af';
  const toolbarBg  = theme === 'light' ? '#f3f4f6' : '#1a2942';

  function getWeeks(month) {
    const weeks = [];
    const mEnd = new Date(2026, month + 1, 0);
    let d = new Date(2026, month, 1);
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
    let wi = 1;
    while (true) {
      const s = new Date(d);
      const e = new Date(d);
      e.setDate(e.getDate() + 6);
      if (s > mEnd) break;
      if (e <= mEnd) {
        weeks.push({ weekNum: wi, start: s, end: new Date(e) });
        wi++;
      }
      d.setDate(d.getDate() + 7);
    }
    return weeks;
  }

  function fmt(d) { return `${SHORT[d.getMonth()]} ${d.getDate()}`; }
  function isCurrent(s, e) { return today >= s && today <= e; }

  function getMonthNoteCount(mi) {
    return getWeeks(mi).filter(w => {
      const key = `${mi}-${w.weekNum}`;
      return calendarNotes[key] && calendarNotes[key].replace(/<[^>]*>/g, '').trim();
    }).length;
  }

  function isCurrentMonth(mi) {
    return today.getFullYear() === 2026 && today.getMonth() === mi;
  }

  function openMonth(mi) {
    setExpandedMonth(mi);
    setView('weeks');
    setCalendarSelectedKey(null);
    setCalendarNoteText('');
    setCalendarNoteDirty(false);
  }

  function openWeek(key) {
    if (calendarSelectedKey === key) {
      setView('weeks');
      setCalendarSelectedKey(null);
      setCalendarNoteText('');
      setCalendarNoteDirty(false);
      return;
    }
    setCalendarSelectedKey(key);
    const existing = calendarNotes[key] || '';
    setCalendarNoteText(existing);
    setCalendarNoteDirty(false);
    setView('editor');
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = existing;
    }, 0);
  }

  function goToGrid() {
    setView('grid');
    setExpandedMonth(null);
    setCalendarSelectedKey(null);
    setCalendarNoteText('');
    setCalendarNoteDirty(false);
  }

  function goToWeeks() {
    setView('weeks');
    setCalendarSelectedKey(null);
    setCalendarNoteText('');
    setCalendarNoteDirty(false);
  }

  // Navigate prev/next week without going back to week list
  function navigateWeek(direction) {
    if (!calendarSelectedKey || expandedMonth === null) return;
    const weeks = getWeeks(expandedMonth);
    const currentWeekNum = parseInt(calendarSelectedKey.split('-')[1]);
    const currentIdx = weeks.findIndex(w => w.weekNum === currentWeekNum);
    const nextIdx = currentIdx + direction;
    if (nextIdx < 0 || nextIdx >= weeks.length) return;
    const nextWeek = weeks[nextIdx];
    const nextKey = `${expandedMonth}-${nextWeek.weekNum}`;
    setCalendarSelectedKey(nextKey);
    const existing = calendarNotes[nextKey] || '';
    setCalendarNoteText(existing);
    setCalendarNoteDirty(false);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = existing;
    }, 0);
  }

 React.useEffect(() => {
    if (view === 'editor' && calendarSelectedKey && editorRef.current) {
      editorRef.current.innerHTML = calendarNotes[calendarSelectedKey] || '';
    }
  }, [calendarSelectedKey, view]);

  React.useEffect(() => {
   function handleSelectionChange() {
      if (view !== 'editor') return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (!node) return;
      const el = node.nodeType === 3 ? node.parentElement : node;
      if (!editorRef.current || !editorRef.current.contains(el)) return;
      const computed = window.getComputedStyle(el);
      const px = Math.round(parseFloat(computed.fontSize));
      const validSizes = [10, 11, 13, 16, 18, 24, 32];
      setCurrentFontSize(validSizes.includes(px) ? String(px) : '');
      // Use computed styles directly — queryCommandState is unreliable on inherited/empty lines
      const newFormats = {
        bold: computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700,
        italic: computed.fontStyle === 'italic',
        underline: computed.textDecorationLine?.includes('underline') ?? false,
        strikeThrough: computed.textDecorationLine?.includes('line-through') ?? false,
      };
      activeFormatsRef.current = newFormats;
      setActiveFormats({ ...newFormats });
    }
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [view]);

function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (!savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }

  function execCmd(cmd, value) {
    restoreSelection();
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand(cmd, false, value || null);
    if (editorRef.current) {
      setCalendarNoteText(editorRef.current.innerHTML);
      setCalendarNoteDirty(true);
    }
  if (['bold', 'italic', 'underline', 'strikeThrough'].includes(cmd)) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const node = sel.anchorNode;
        if (!node) return;
        const el = node.nodeType === 3 ? node.parentElement : node;
        if (!editorRef.current || !editorRef.current.contains(el)) return;
        const computed = window.getComputedStyle(el);
        const newFormats = {
          bold: computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700,
          italic: computed.fontStyle === 'italic',
          underline: computed.textDecorationLine?.includes('underline') ?? false,
          strikeThrough: computed.textDecorationLine?.includes('line-through') ?? false,
        };
        activeFormatsRef.current = newFormats;
        setActiveFormats({ ...newFormats });
      }, 0);
    }
    saveSelection();
  }
  function handleEditorInput() {
    if (editorRef.current) {
      setCalendarNoteText(editorRef.current.innerHTML);
      setCalendarNoteDirty(true);
    }
  }

  function handleSave() {
    const html = editorRef.current ? editorRef.current.innerHTML : calendarNoteText;
    onSave(calendarSelectedKey, html);
  }

  const charCount = calendarNoteText.replace(/<[^>]*>/g, '').length;

  const btnStyle = {
    width: '26px', height: '26px', border: 'none', borderRadius: '5px',
    cursor: 'pointer', flexShrink: 0, background: 'transparent', color: textSub,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
  };
  const divider = <div style={{ width: '0.5px', height: '18px', background: cardBorder, flexShrink: 0 }} />;

return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: '12px',
      padding: '16px',
    }}>

      {/* ── GRID VIEW ── */}
      {view === 'grid' && (
        <div>
          <p style={{
            fontWeight: '400', fontSize: '1rem', marginBottom: '12px',
            background: 'linear-gradient(to right, #10b981, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Farm Calendar 2026
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {MONTHS.map((name, mi) => {
              const noteCount = getMonthNoteCount(mi);
              const isCurMonth = isCurrentMonth(mi);
              const weeks = getWeeks(mi);
              return (
                <div
                  key={mi}
                  onClick={() => openMonth(mi)}
                  style={{
                    border: isCurMonth ? '1.5px solid #9FE1CB' : `0.5px solid ${cardBorder}`,
                    borderRadius: '8px', padding: '8px',
                    background: isCurMonth ? '#E1F5EE' : cardBg,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isCurMonth ? '#0F6E56' : textMain }}>
                      {SHORT[mi]}
                    </span>
                    {noteCount > 0 && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
                    )}
                  </div>
                  {weeks.map(w => {
                    const key = `${mi}-${w.weekNum}`;
                    const hasNote = !!(calendarNotes[key] && calendarNotes[key].replace(/<[^>]*>/g, '').trim());
                    const curr = isCurrent(w.start, w.end);
                    return (
                      <div key={key} style={{
                        height: '4px', borderRadius: '99px',
                        background: curr ? '#9FE1CB' : (theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.1)'),
                        marginBottom: '3px', overflow: 'hidden',
                      }}>
                        {hasNote && <div style={{ height: '100%', background: curr ? '#0F6E56' : '#1D9E75', borderRadius: '99px' }} />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEKS VIEW ── */}
      {view === 'weeks' && (
        <div>
          <button onClick={goToGrid} style={{ background: 'none', border: 'none', color: textSub, fontSize: '0.8rem', cursor: 'pointer', padding: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← All months
          </button>
          <p style={{ fontWeight: '600', fontSize: '1rem', color: textMain, marginBottom: '10px' }}>
            {MONTHS[expandedMonth]}
          </p>
          {getWeeks(expandedMonth).map(w => {
            const key = `${expandedMonth}-${w.weekNum}`;
            const curr = isCurrent(w.start, w.end);
            const hasNote = !!(calendarNotes[key] && calendarNotes[key].replace(/<[^>]*>/g, '').trim());
            return (
              <div
                key={key}
                onClick={() => openWeek(key)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 10px', borderRadius: '8px',
                  cursor: 'pointer', marginBottom: '4px',
                  border: curr ? '0.5px solid #9FE1CB' : '0.5px solid transparent',
                  background: curr ? '#E1F5EE' : 'transparent',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = theme === 'light' ? '#f3f4f6' : 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = curr ? '#E1F5EE' : 'transparent'; }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginRight: '8px', background: hasNote ? '#1D9E75' : curr ? '#9FE1CB' : cardBorder }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500', minWidth: '60px', color: curr ? '#0F6E56' : textMain }}>Week {w.weekNum}</span>
                <span style={{ fontSize: '0.8rem', color: curr ? '#1D9E75' : textSub }}>{fmt(w.start)} – {fmt(w.end)}</span>
                {hasNote && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#1D9E75', fontWeight: '600' }}>note</span>}
                <span style={{ marginLeft: hasNote ? '8px' : 'auto', fontSize: '0.75rem', color: textSub }}>›</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EDITOR VIEW ── */}
      {view === 'editor' && calendarSelectedKey && expandedMonth !== null && (() => {
        const mi = expandedMonth;
        const weekNum = parseInt(calendarSelectedKey.split('-')[1]);
        const weeks = getWeeks(mi);
        const currentIdx = weeks.findIndex(w => w.weekNum === weekNum);
        const currentWeek = weeks[currentIdx];
        const hasPrev = currentIdx > 0;
        const hasNext = currentIdx < weeks.length - 1;
        return (
          <div>
            <button onClick={goToWeeks} style={{ background: 'none', border: 'none', color: textSub, fontSize: '0.8rem', cursor: 'pointer', padding: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Back to {MONTHS[mi]}
            </button>
            <div style={{ display: userRole === 'employee' ? 'none' : 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', background: toolbarBg, borderBottom: `0.5px solid ${cardBorder}`, flexWrap: 'nowrap', overflowX: 'auto' }}>
            <button style={{ ...btnStyle, fontWeight: 'bold', background: activeFormats.bold ? '#9FE1CB' : 'transparent', color: activeFormats.bold ? '#085041' : textSub }} onPointerDown={e => { e.preventDefault(); saveSelection(); execCmd('bold'); }} onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('bold'); }} title="Bold">B</button>
                <button style={{ ...btnStyle, fontStyle: 'italic', background: activeFormats.italic ? '#9FE1CB' : 'transparent', color: activeFormats.italic ? '#085041' : textSub }} onPointerDown={e => { e.preventDefault(); saveSelection(); execCmd('italic'); }} onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('italic'); }} title="Italic">I</button>
                <button style={{ ...btnStyle, textDecoration: 'underline', background: activeFormats.underline ? '#9FE1CB' : 'transparent', color: activeFormats.underline ? '#085041' : textSub }} onPointerDown={e => { e.preventDefault(); saveSelection(); execCmd('underline'); }} onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('underline'); }} title="Underline">U</button>
                <button style={{ ...btnStyle, textDecoration: 'line-through', background: activeFormats.strikeThrough ? '#9FE1CB' : 'transparent', color: activeFormats.strikeThrough ? '#085041' : textSub }} onPointerDown={e => { e.preventDefault(); saveSelection(); execCmd('strikeThrough'); }} onMouseDown={e => { e.preventDefault(); saveSelection(); execCmd('strikeThrough'); }} title="Strikethrough">S</button>
                {divider}
                <select style={{ height: '26px', padding: '0 4px', fontSize: '11px', border: `0.5px solid ${cardBorder}`, borderRadius: '5px', background: theme === 'light' ? '#ffffff' : '#1e3a5f', color: textMain, cursor: 'pointer', width: '72px', flexShrink: 0 }} onMouseDown={e => e.stopPropagation()} onChange={e => { if (editorRef.current) editorRef.current.focus(); const v = e.target.value; if (v === 'H1') document.execCommand('formatBlock', false, 'h2'); else if (v === 'H2') document.execCommand('formatBlock', false, 'h3'); else if (v === 'Small') document.execCommand('fontSize', false, '1'); else document.execCommand('formatBlock', false, 'p'); handleEditorInput(); e.target.value = 'Normal'; }} defaultValue="Normal">
                  <option value="Normal">Normal</option>
                  <option value="H1">H1</option>
                  <option value="H2">H2</option>
                  <option value="Small">Small</option>
                </select>
               <select ref={fontSizeSelectRef} value={currentFontSize} style={{ height: '26px', padding: '0 4px', fontSize: '11px', border: `0.5px solid ${cardBorder}`, borderRadius: '5px', background: theme === 'light' ? '#ffffff' : '#1e3a5f', color: textMain, cursor: 'pointer', width: '48px', flexShrink: 0 }} onMouseDown={e => { e.stopPropagation(); saveSelection(); }} onChange={e => {
                    const px = e.target.value;
                    restoreSelection();
                    if (editorRef.current) editorRef.current.focus();
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      if (!sel.isCollapsed) {
                        document.execCommand('fontSize', false, '7');
                        const spans = editorRef.current.querySelectorAll('font[size="7"]');
                        spans.forEach(span => {
                          span.removeAttribute('size');
                          span.style.fontSize = px + 'px';
                        });
                      } else {
                        const span = document.createElement('span');
                        span.style.fontSize = px + 'px';
                        span.appendChild(document.createTextNode('\u200b'));
                        const range = sel.getRangeAt(0);
                        range.insertNode(span);
                        range.setStartAfter(span.firstChild);
                        range.setEndAfter(span.firstChild);
                        sel.removeAllRanges();
                        sel.addRange(range);
                      }
                    }
                    handleEditorInput();
                    setCurrentFontSize(px);
                  }}>
                  <option value="" disabled>px</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="13">13</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                  <option value="32">32</option>
                </select>
                {divider}
                {[['#fef08a','#ca8a04','Yellow'],['#bbf7d0','#16a34a','Green'],['#bfdbfe','#2563eb','Blue'],['#fecaca','#dc2626','Red']].map(([bg, border, label]) => (
                  <div key={label} style={{ width: '18px', height: '18px', borderRadius: '3px', background: bg, border: `0.5px solid ${border}`, cursor: 'pointer', flexShrink: 0 }} onMouseDown={e => { e.preventDefault(); execCmd('hiliteColor', bg); }} onTouchEnd={e => { e.preventDefault(); execCmd('hiliteColor', bg); }} title={`${label} highlight`} />
                ))}
                <div style={{ width: '18px', height: '18px', borderRadius: '3px', background: theme === 'light' ? '#ffffff' : '#1e3a5f', border: `0.5px solid ${cardBorder}`, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: textSub, fontWeight: 'bold' }} onMouseDown={e => { e.preventDefault(); execCmd('hiliteColor', 'transparent'); }} onTouchEnd={e => { e.preventDefault(); execCmd('hiliteColor', 'transparent'); }} title="Remove highlight">✕</div>
                {divider}
                <button style={btnStyle} onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} onTouchStart={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} title="Bullet list">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.5" fill="currentColor"/><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="7" r="1.5" fill="currentColor"/><rect x="5" y="6" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="10.5" r="1.5" fill="currentColor"/><rect x="5" y="9.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
                </button>
                <button style={btnStyle} onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }} onTouchStart={e => { e.preventDefault(); execCmd('insertOrderedList'); }} title="Numbered list">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><text x="0" y="5" fontSize="5" fill="currentColor">1.</text><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><text x="0" y="9.5" fontSize="5" fill="currentColor">2.</text><rect x="5" y="7" width="8" height="2" rx="1" fill="currentColor"/><text x="0" y="13.5" fontSize="5" fill="currentColor">3.</text><rect x="5" y="11.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
                </button>
                {divider}
                {(() => {
                 const emojis = [
                    '✅','❌','⚠️','📋','🔧','🚜','📦','⏰','📅','🌱',
                    '💧','☀️','🌧️','❄️','🔥','⛽','🛢️','🪛','🔩','📝',
                    '👍','👎','⭐','🚨','💡','📞','🏁','✔️','➡️','⬆️',
                    '⬇️','🌾','🐄','🐖','🐓','🐑','🌽','🥕','🍎','🌻',
                    '😀','😂','😊','😍','🤩','😎','🥳','😅','🤔','😴',
                    '😤','🥰','😇','🤝','💪','🙌','👋','🫡','🧑‍🌾','👷',
                    '👨‍💼','👩‍💼','🎅','🤶','🎄','🎃','🎆','🎇','🎉','🎊',
                    '🏆','🎁','❤️','🧡','💛','💚','💙','💜','🖤','🤍',
                  ];
                  return (
                    <div ref={emojiPickerRef} style={{ position: 'relative' }}>
                     <button
                        style={{ ...btnStyle, fontSize: '14px', width: 'auto', padding: '0 4px' }}
                        onMouseDown={e => { e.preventDefault(); setShowEmojiPicker(p => !p); }}
                        onTouchEnd={e => { e.preventDefault(); setShowEmojiPicker(p => !p); }}
                        title="Insert emoji"
                      >
                        😊
                      </button>
                      {showEmojiPicker && (
                        <div
                         style={{
                            position: 'fixed',
                            top: 'auto',
                            bottom: '60px',
                            left: 'auto',
                            zIndex: 9999,
                            background: theme === 'light' ? '#ffffff' : '#1e3a5f',
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '10px',
                            padding: '8px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '4px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            width: '196px',
                          }}
                        >
                          {emojis.map(emoji => (
                            <button
                              key={emoji}
                        onMouseDown={e => {
                                e.preventDefault();
                                if (editorRef.current) editorRef.current.focus();
                                document.execCommand('insertText', false, emoji);
                                handleEditorInput();
                                setShowEmojiPicker(false);
                              }}
                            onTouchEnd={e => {
                                e.preventDefault();
                                if (editorRef.current) editorRef.current.focus();
                                document.execCommand('insertText', false, emoji);
                                handleEditorInput();
                                setShowEmojiPicker(false);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '3px',
                                borderRadius: '4px',
                                lineHeight: 1,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = theme === 'light' ? '#f3f4f6' : 'rgba(255,255,255,0.1)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
          <div
                ref={editorRef}
                contentEditable={userRole !== 'employee'}
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onTouchEnd={saveSelection}
            onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      const node = sel.anchorNode;
                      const el = node?.nodeType === 3 ? node.parentElement : node;
                      const isEmpty = el?.textContent?.trim() === '' || range.collapsed && node?.textContent === '';
                      if (isEmpty) {
                        e.preventDefault();
                        document.execCommand('removeFormat');
                        document.execCommand('insertParagraph');
                        const newFormats = { bold: false, italic: false, underline: false, strikeThrough: false };
                        activeFormatsRef.current = newFormats;
                        setActiveFormats({ ...newFormats });
                        handleEditorInput();
                        return;
                      }
                    }
                  }
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const sel = window.getSelection();
                    const inList = sel && sel.anchorNode && !!sel.anchorNode.parentElement?.closest('li');
                    if (inList) {
                      if (e.shiftKey) {
                        document.execCommand('outdent', false, null);
                      } else {
                        document.execCommand('indent', false, null);
                      }
                    } else {
                      if (!e.shiftKey) {
                        document.execCommand('insertText', false, '\u00a0\u00a0\u00a0\u00a0');
                      }
                    }
                    handleEditorInput();
                  }
                  if (e.key === 'Backspace') {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      if (range.collapsed) {
                        const li = sel.anchorNode?.parentElement?.closest('li');
                        if (li && li.textContent.trim() === '') {
                          e.preventDefault();
                          document.execCommand('outdent', false, null);
                          handleEditorInput();
                        }
                      }
                    }
                  }
                }}
                data-placeholder="Add notes for this week — tasks, plans, reminders..."
                style={{
                  minHeight: '140px',
                  padding: '10px 12px 10px 28px',
                  fontSize: '13px',
                  color: textMain,
                  background: theme === 'light' ? '#f9fafb' : '#1a2942',
                  outline: 'none',
                  lineHeight: '1.6',
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                }}
              />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: textSub }}>{charCount} character{charCount !== 1 ? 's' : ''}</span>
              {userRole !== 'employee' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {calendarSaved && <span style={{ fontSize: '12px', color: '#1D9E75' }}>Saved</span>}
                  <button onClick={handleSave} disabled={!calendarNoteDirty || calendarSaving} style={{ background: !calendarNoteDirty || calendarSaving ? (theme === 'light' ? '#e5e7eb' : '#374151') : '#1D9E75', color: !calendarNoteDirty || calendarSaving ? textSub : '#fff', border: 'none', borderRadius: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: '500', cursor: !calendarNoteDirty || calendarSaving ? 'default' : 'pointer' }}>
                    {calendarSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
              {userRole === 'employee' && (
                <span style={{ fontSize: '11px', color: textSub, fontStyle: 'italic' }}>Read only</span>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
function ServiceOverview({ serviceReminders, machineHours, machineKm, theme, isDesktop, onReminderClick }) {
  const getHours = (name) => {
    const r = machineHours.find(h => h.machine_name === name);
    return r ? parseFloat(r.current_hours || 0) : 0;
  };
  const getKm = (name) => {
    const r = machineKm.find(h => h.machine_name === name);
    return r ? parseFloat(r.current_km || 0) : 0;
  };

  const active = serviceReminders.filter(r => !r.deleted_at);

  const withStatus = active.map(r => {
    const isKm = r.reminder_type === 'km';
    const current = isKm ? getKm(r.machine_name) : getHours(r.machine_name);
    const last = isKm ? parseFloat(r.last_service_km || 0) : parseFloat(r.last_service_hours || 0);
    const interval = isKm ? parseFloat(r.km_interval || 0) : parseFloat(r.hours_interval || 0);
    const used = current - last;
    const progress = interval > 0 ? Math.min(100, Math.round((used / interval) * 100)) : 0;
    const remaining = interval - used;
    const isOverdue = used >= interval;
    const isDueSoon = !isOverdue && remaining <= interval * 0.15;
    const priority = isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'upcoming';
    const overageLabel = isOverdue
      ? `${Math.abs(remaining).toFixed(0)} ${isKm ? 'km' : 'hrs'} over`
      : `${remaining.toFixed(0)} ${isKm ? 'km' : 'hrs'} remaining`;

    return { ...r, current, progress, remaining, isOverdue, isDueSoon, priority, overageLabel, isKm };
  });

  const sorted = [
    ...withStatus.filter(r => r.priority === 'overdue'),
    ...withStatus.filter(r => r.priority === 'due-soon'),
    ...withStatus.filter(r => r.priority === 'upcoming'),
  ];

  const overdueCount = sorted.filter(r => r.priority === 'overdue').length;
  const dueSoonCount = sorted.filter(r => r.priority === 'due-soon').length;
  const upcomingCount = sorted.filter(r => r.priority === 'upcoming').length;
  const allClear = overdueCount === 0 && dueSoonCount === 0;

const priorityConfig = {
  overdue:   { label: 'OVERDUE',  color: '#ef4444', bg: theme === 'light' ? '#ffffff' : 'rgba(239,68,68,0.12)',  border: theme === 'light' ? '#fca5a5' : 'rgba(239,68,68,0.4)',  accentBorder: theme === 'light' ? '5px solid #ef4444' : null },
  'due-soon':{ label: 'DUE SOON', color: theme === 'light' ? '#d97706' : '#f59e0b', bg: theme === 'light' ? '#ffffff' : 'rgba(245,158,11,0.12)', border: theme === 'light' ? '#fcd34d' : 'rgba(245,158,11,0.4)', accentBorder: theme === 'light' ? '5px solid #f59e0b' : null },
  upcoming:  { label: 'UPCOMING', color: theme === 'light' ? '#059669' : '#10b981', bg: theme === 'light' ? '#ffffff' : 'rgba(16,185,129,0.10)', border: theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.3)', accentBorder: theme === 'light' ? '5px solid #10b981' : null },
};
  const cardBg   = theme === 'light' ? '#ffffff' : '#1e3a5f';
  const cardBdr  = theme === 'light' ? '#e5e7eb' : '#2563eb';
  const textMain = theme === 'light' ? '#111827' : '#f0fdf4';
  const textSub  = theme === 'light' ? '#6b7280' : '#9ca3af';

return (
    <div style={{
      padding: isDesktop ? '16px 20px' : '14px 16px',
    }}>
{/* Section header */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: '11px', color: textSub, fontWeight: '500', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Service overview
        </p>
      </div>

      {/* All Clear state */}
      {allClear && active.length > 0 && (
        <div style={{
          padding: '18px 20px',
          background: theme === 'light' ? '#f0fdf4' : 'rgba(16,185,129,0.10)',
          border: `1px solid ${theme === 'light' ? '#6ee7b7' : 'rgba(16,185,129,0.35)'}`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <span style={{ fontSize: '1.6rem' }}>✅</span>
          <div>
            <p style={{ fontWeight: 700, color: '#10b981', margin: 0, fontSize: '0.95rem' }}>All Clear</p>
            <p style={{ color: textSub, margin: 0, fontSize: '0.8rem', marginTop: 2 }}>
              {upcomingCount > 0
                ? `${upcomingCount} reminder${upcomingCount !== 1 ? 's' : ''} active — nothing due yet.`
                : 'No service reminders are due. You\'re all caught up.'}
            </p>
          </div>
        </div>
      )}

      {/* No reminders at all */}
      {active.length === 0 && (
        <div style={{
          padding: '18px 20px',
          background: cardBg,
          border: `1px solid ${cardBdr}`,
          borderRadius: 12,
          color: textSub,
          fontSize: '0.875rem',
        }}>
          No service reminders set yet. Add reminders in the Machinery tab.
        </div>
      )}

      {/* Summary tiles — only show when there's something to report */}
      {!allClear && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 14,
        }}>
          {[
            { key: 'overdue',   label: 'Overdue',  count: overdueCount  },
            { key: 'due-soon',  label: 'Due Soon', count: dueSoonCount  },
            { key: 'upcoming',  label: 'Upcoming', count: upcomingCount },
          ].map(({ key, label, count }) => {
            const p = priorityConfig[key];
            return (
              <div key={key} style={{
                background: count > 0 ? p.bg : (theme === 'light' ? '#f9fafb' : 'rgba(255,255,255,0.02)'),
                border: `1px solid ${count > 0 ? p.border : cardBdr}`,
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{
                  fontSize: '1.8rem', fontWeight: 800,
                  color: count > 0 ? p.color : textSub,
                  lineHeight: 1, marginBottom: 4,
                }}>
                  {String(count).padStart(2, '0')}
                </div>
                <div style={{
                  fontSize: '0.7rem', letterSpacing: '0.1em',
                  color: count > 0 ? p.color : textSub,
                  fontWeight: 600, textTransform: 'uppercase',
                }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work queue rows — only overdue + due-soon */}
      {!allClear && sorted.filter(r => r.priority !== 'upcoming').map((r, i) => {
        const p = priorityConfig[r.priority];
        return (
          <div
            key={r.id}
            onClick={() => onReminderClick()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 16px',
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderLeft: p.accentBorder || `1px solid ${p.border}`,
              borderRadius: 10,
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${p.bg}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Priority dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: p.color, flexShrink: 0,
            }} />

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                flexWrap: 'wrap', marginBottom: 4,
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: textMain }}>
                  {r.machine_name}
                </span>
                <span style={{
                  fontSize: '0.75rem', color: textSub,
                }}>
                  — {r.reminder_name}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{
                height: 4, borderRadius: 99,
                background: theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${r.progress}%`,
                  background: p.color,
                  borderRadius: 99,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* Right: status + metric */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700,
                color: p.color, letterSpacing: '0.08em',
                marginBottom: 1,
              }}>
                {p.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: textMain, fontWeight: 600 }}>
                {r.overageLabel}
              </div>
              <div style={{ fontSize: '0.68rem', color: textSub }}>
                {r.current.toFixed(1)} {r.isKm ? 'km' : 'hrs'} current
              </div>
            </div>

            {/* Arrow */}
            <div style={{ color: p.color, fontSize: '0.9rem', flexShrink: 0 }}>→</div>
          </div>
        );
      })}

      {/* Upcoming count hint when all clear */}
      {!allClear && upcomingCount > 0 && (
        <p style={{
          color: textSub, fontSize: '0.78rem',
          marginTop: 4, paddingLeft: 4,
        }}>
          + {upcomingCount} upcoming reminder{upcomingCount !== 1 ? 's' : ''} not yet due
        </p>
      )}
    </div>
  );
}

function LoadingScreen() {
  const [progress, setProgress] = React.useState(0);
  const [statusIndex, setStatusIndex] = React.useState(0);

  const statusMessages = [
    '🌱 Connecting to database...',
    '📦 Loading inventory...',
    '🚜 Loading machinery...',
    '🔧 Loading service records...',
    '⏰ Loading reminders...',
    '✅ Almost ready...',
  ];

  React.useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const increment = prev < 60 ? 3 : prev < 85 ? 1.5 : 0.5;
        return Math.min(95, prev + increment);
      });
    }, 80);

    const statusInterval = setInterval(() => {
      setStatusIndex(prev =>
        prev < statusMessages.length - 1 ? prev + 1 : prev
      );
    }, 900);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>

      {/* Tractor Icon with pulse ring */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          animation: 'loadingPulse 2s ease-in-out infinite',
        }} />
        {/* Inner pulse ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: '2px solid rgba(16, 185, 129, 0.25)',
          animation: 'loadingPulse 2s ease-in-out infinite 0.3s',
        }} />
        {/* Icon circle */}
        <div style={{
          width: '90px',
          height: '90px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.8rem',
          animation: 'tractorBounce 1.8s ease-in-out infinite',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
        }}>
          🚜
        </div>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #10b981, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
        textAlign: 'center',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
      }}>
        AgriTrack Manager
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.875rem',
        marginBottom: '40px',
        letterSpacing: '0.05em',
      }}>
        Dahlton Ag Ventures
      </p>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(to right, #10b981, #06b6d4)',
            borderRadius: '999px',
            transition: 'width 0.15s ease-out',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '6px',
        }}>
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
          }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status message */}
      <p style={{
        color: 'rgba(255,255,255,0.75)',
        fontSize: '0.9rem',
        textAlign: 'center',
        minHeight: '24px',
        animation: 'statusFade 0.5s ease-in-out',
        key: statusIndex,
      }}>
        {statusMessages[statusIndex]}
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loadingPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.15; }
        }
        @keyframes tractorBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes statusFade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Zoomable Image Viewer Component with Photo Navigation, Pan/Drag, Pinch & Scroll Zoom
function ZoomableImageViewer({ imageUrl, title, onClose, theme, allPhotos, startIndex, isDesktop }) {
  const [scale, setScale] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(startIndex || 0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = React.useState(null);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = '';
  };
}, []);
  
  const photos = allPhotos || [imageUrl];
  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[currentIndex];
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
const resetZoom = () => {
  setScale(1);
  setPosition({ x: 0, y: 0 });
};
const rotatePhoto = () => setRotation(prev => (prev + 90) % 360);
  
const nextPhoto = () => {
  if (currentIndex < photos.length - 1) {
    setCurrentIndex(prev => prev + 1);
    resetZoom();
  }
};

const prevPhoto = () => {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
    resetZoom();
  }
};
  
  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(1, Math.min(3, prev + delta)));
  };
  
  // Touch drag handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      // Single finger drag (only when zoomed)
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastPinchDistance(distance);
    }
  };
  
  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      // Single finger drag
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && lastPinchDistance) {
      // Two finger pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const delta = (distance - lastPinchDistance) * 0.01;
      setScale(prev => Math.max(1, Math.min(3, prev + delta)));
      setLastPinchDistance(distance);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setLastPinchDistance(null);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };
  
  // Reset position when scale changes
  React.useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);
  
  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, photos.length]);
  
 return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: !isDesktop ? '8px' : '24px',
        zIndex: 100
      }}
      onClick={onClose}
    >
{/* Header */}
<div 
  style={{
    background: theme.cardBackground,
    padding: '6px 10px',
    borderRadius: '8px',
    marginBottom: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '95vw',
    boxSizing: 'border-box'
  }}
  onClick={(e) => e.stopPropagation()}
>
  <h3 style={{ 
    color: theme.text, 
    margin: 0,
    fontSize: '0.7rem',
    textAlign: 'center',
    width: '100%',
    wordBreak: 'break-word',
    lineHeight: '1.1',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  }}>
    {title} {hasMultiplePhotos && `(${currentIndex + 1}/${photos.length})`}
  </h3>
  <button
    onClick={onClose}
    style={{
      padding: '3px 8px',
      background: '#2563eb',
      border: 'none',
      borderRadius: '5px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.7rem',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }}
  >
    Close ✕
  </button>
</div>
      
      {/* Image Container with Navigation Arrows */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          zIndex: 1,
          gap: '20px',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Left Arrow */}
        {hasMultiplePhotos && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            disabled={currentIndex === 0}
              style={{
              position: 'absolute',
              left: !isDesktop ? '8px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: !isDesktop ? '4px 8px' : '8px 12px',
              background: currentIndex === 0 ? 'rgba(107, 114, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              color: currentIndex === 0 ? '#6b7280' : '#000000',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              zIndex: 10,
              opacity: currentIndex === 0 ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== 0) {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = currentIndex === 0 ? 'rgba(107, 114, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ◀
          </button>
        )}
        
       {/* Image */}
<img 
  src={currentPhoto} 
  alt="View" 
  style={{ 
    maxWidth: '95vw',
    maxHeight: !isDesktop ? '60vh' : '75vh',
    objectFit: 'contain',
    borderRadius: '8px',
    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease',
    position: 'relative',
    zIndex: 1,
    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none'
  }} 
  onClick={(e) => e.stopPropagation()}
  onMouseDown={handleMouseDown}
  onTouchStart={handleTouchStart}
  draggable={false}
/>
        
        {/* Right Arrow */}
        {hasMultiplePhotos && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            disabled={currentIndex === photos.length - 1}
              style={{
              position: 'absolute',
              right: !isDesktop ? '8px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: !isDesktop ? '4px 8px' : '8px 12px',
              background: currentIndex === photos.length - 1 ? 'rgba(107, 114, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              color: currentIndex === photos.length - 1 ? '#6b7280' : '#000000',
              cursor: currentIndex === photos.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              zIndex: 10,
              opacity: currentIndex === photos.length - 1 ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== photos.length - 1) {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = currentIndex === photos.length - 1 ? 'rgba(107, 114, 128, 0.5)' : 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ▶
          </button>
        )}
      </div>
      
      {/* Zoom Controls */}
      <div 
        style={{
          background: theme.cardBackground,
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={zoomOut} 
          disabled={scale <= 1} 
          style={{ 
            padding: '8px 16px', 
            background: scale <= 1 ? '#6b7280' : '#10b981', 
            border: 'none', 
            borderRadius: '8px', 
            color: 'white', 
            cursor: scale <= 1 ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold' 
          }}
        >
          −
        </button>
        <span 
          style={{ 
            color: theme.text, 
            fontWeight: 'bold', 
            minWidth: '60px', 
            textAlign: 'center' 
          }}
        >
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={zoomIn} 
          disabled={scale >= 3} 
          style={{ 
            padding: '8px 16px', 
            background: scale >= 3 ? '#6b7280' : '#10b981', 
            border: 'none', 
            borderRadius: '8px', 
            color: 'white', 
            cursor: scale >= 3 ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold' 
          }}
        >
          +
        </button>
        <button 
  onClick={resetZoom} 
  disabled={scale === 1} 
  style={{ 
    padding: '8px 16px', 
    background: scale === 1 ? '#6b7280' : '#2563eb', 
    border: 'none', 
    borderRadius: '8px', 
    color: 'white', 
    cursor: scale === 1 ? 'not-allowed' : 'pointer', 
    fontWeight: 'bold' 
  }}
>
  Reset
</button>
<button
  onClick={rotatePhoto}
  style={{
    padding: '8px 16px',
    background: '#bae6fd',
    border: 'none',
    borderRadius: '8px',
    color: '#000000',
    cursor: 'pointer',
    fontWeight: 'bold'
  }}
>
  ↻ Rotate
</button>
      </div>
    </div>
  );
}
function TechnicianField({ value, onChange, styles, technicians }) {
  // value is a string — we split/join with ', ' as the separator
  const selectedNames = value ? value.split(', ').map(s => s.trim()).filter(Boolean) : [];

  const [customInput, setCustomInput] = React.useState('');
  const [showCustom, setShowCustom] = React.useState(false);

  const toggleTechnician = (name) => {
    if (selectedNames.includes(name)) {
      onChange(selectedNames.filter(n => n !== name).join(', '));
    } else {
      onChange([...selectedNames, name].join(', '));
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selectedNames.includes(trimmed)) {
      onChange([...selectedNames, trimmed].join(', '));
    }
    setCustomInput('');
    setShowCustom(false);
  };

  const removeTechnician = (name) => {
    onChange(selectedNames.filter(n => n !== name).join(', '));
  };

  return (
    <div style={{ marginBottom: '16px' }}>
       <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '6px' }}>Technician(s)</p>
      {/* Selected technicians as tags */}
      {selectedNames.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {selectedNames.map(name => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px',
              background: styles.input.background,
              border: '1px solid #10b981',
              borderRadius: '20px',
              fontSize: '0.875rem',
              color: styles.input.color,
            }}>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeTechnician(name)}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#ef4444', cursor: 'pointer',
                  fontSize: '1rem', lineHeight: 1, padding: '0 0 0 2px'
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Technician list as checkboxes */}
      {technicians.length > 0 && (
        <div style={{
          border: `1px solid ${styles.input.borderColor || '#2563eb'}`,
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '8px',
          maxHeight: '160px',
          overflowY: 'auto',
        }}>
          {technicians.map(t => {
            const isSelected = selectedNames.includes(t.name);
            return (
              <div
                key={t.id}
                onClick={() => toggleTechnician(t.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', cursor: 'pointer',
                  background: isSelected
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'transparent',
                  borderBottom: `1px solid ${styles.input.borderColor || '#374151'}`,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                  border: `2px solid ${isSelected ? '#10b981' : '#6b7280'}`,
                  background: isSelected ? '#10b981' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: 'white'
                }}>
                  {isSelected && '✓'}
                </div>
                <span style={{ fontSize: '0.9rem', color: styles.input.color }}>{t.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add custom technician */}
      {showCustom ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            style={{ ...styles.input, marginBottom: 0, flex: 1 }}
            placeholder="Enter technician name"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            autoFocus
          />
          <button
            type="button"
            onClick={addCustom}
            style={{
              padding: '8px 14px', background: '#10b981', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >Add</button>
          <button
            type="button"
            onClick={() => { setShowCustom(false); setCustomInput(''); }}
            style={{
              padding: '8px 14px', background: '#4b5563', border: 'none',
              borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >Cancel</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          style={{
            padding: '6px 12px', background: 'transparent',
            border: `1px dashed ${styles.input.borderColor || '#6b7280'}`,
            borderRadius: '8px', color: styles.input.color,
            cursor: 'pointer', fontSize: '0.8rem', width: '100%'
          }}
        >
          + Add unlisted technician
        </button>
      )}
    </div>
  );
}
// Modal component - defined outside to avoid recreation on each render
function Modal({ children, onClose, title, theme }) {
  const modalStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50,
    },
   modal: {
  background: theme === 'light' ? '#eff6ff' : '#1e3a5f',
  border: `1px solid ${theme === 'light' ? '#bfdbfe' : '#2563eb'}`,
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  color: theme === 'light' ? '#111827' : 'white',
},
    closeButton: {
      background: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      color: 'white',
      cursor: 'pointer',
    },
  };

  return (
    <div style={modalStyles.modalOverlay}>
      <div style={modalStyles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.5rem' }}>{title}</h3>
          <button onClick={onClose} style={modalStyles.closeButton}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
