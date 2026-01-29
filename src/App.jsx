
// BUILD VERSION: 2025-01-29-v2-FIXED
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Truck, Users, AlertCircle, RefreshCw, Edit2, Save, X, LogOut, ChevronDown, Wrench } from 'lucide-react';

// Theme configurations
const themes = {
  dark: {
    background: '#1e1b4b',
    backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBackground: '#1e3a5f',
    cardBorder: '#2563eb',
    text: 'white',
    textSecondary: '#9ca3af',
    inputBackground: '#1a2942',
    modalBackground: '#1e3a5f',
    tabInactive: '#1e3a5f',
    gradient: 'linear-gradient(to right, #10b981, #06b6d4)',
    homeBackground: 'linear-gradient(135deg, #1e3a5f 0%, #1a2942 100%)',
  },
  light: {
    background: '#f3f4f6',
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    inputBackground: '#f9fafb',
    modalBackground: '#ffffff',
    tabInactive: '#dbeafe',
    gradient: 'linear-gradient(to right, #10b981, #06b6d4)',
    homeBackground: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
  }
};

// Supabase configuration
const supabaseUrl = 'https://ekjjtfemibtaxyhuvgea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVramp0ZmVtaWJ0YXh5aHV2Z2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTM0ODgsImV4cCI6MjA4MzQyOTQ4OH0.c4qjGG0F1nCR0UcyttQKuMX4S_9bJlAPCglzq3fB8v0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Machinery categories for dropdown
const MACHINERY_CATEGORIES = [
  'Land Improvement Equipment',
  'Augers & Conveyors',
  'Straight Cut/Pick Up Headers',
  'Tillage and Seeding',
  'Heavy Trucks/Semi Trucks',
  'Tractors',
  'Blades',
  'Combines',
  'Sprayers',
  'Other'
];

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState('general');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [imageModalTitle, setImageModalTitle] = useState('');
  const lastLocalUpdateRef = useRef(0);
  const isEditingRef = useRef(false);
  const recentlyUpdatedIdsRef = useRef(new Set());

  const [activeTab, setActiveTab] = useState('home');
  const [inventory, setInventory] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [lastSync, setLastSync] = useState(null);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMachineryModal, setShowMachineryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Edit state
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editingMachineryId, setEditingMachineryId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);

const [inventoryForm, setInventoryForm] = useState({ 
  name: '', partNumber: '', quantity: '', location: '', 
  minQuantity: '', maxQuantity: '', photoUrl: ''
});
  const [machineryForm, setMachineryForm] = useState({ 
    name: '', vinSerial: '', category: '', status: 'Active', photoUrl: ''
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
  // Search and sort states
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventorySort, setInventorySort] = useState('name-asc');
  const [machinerySearch, setMachinerySearch] = useState('');
  const [machinerySort, setMachinerySort] = useState('name-asc');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceSort, setServiceSort] = useState('date-desc');
  const [serviceFilter, setServiceFilter] = useState('');
  const [machineSearchModal, setMachineSearchModal] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryItemsPerPage, setInventoryItemsPerPage] = useState(50);
  const [machineryPage, setMachineryPage] = useState(1);
  const [machineryItemsPerPage, setMachineryItemsPerPage] = useState(50);
  const [servicePage, setServicePage] = useState(1);
  const [serviceItemsPerPage, setServiceItemsPerPage] = useState(50);
  
  // Get current theme object
  const currentTheme = themes[theme];

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></svg>";
    document.head.appendChild(link);
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
      // ✅ DON'T SET LOADING FALSE HERE - wait for data to load
    } else {
      // ✅ Only set loading false if there's no user (show login screen)
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
      
      // Fetch user role
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
  
const loadData = async () => {
  try {
    console.log('📥 Loading data...');
    setLoading(true);
    
    // ✅ FETCH ALL INVENTORY - Using proper pagination
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
        hasMoreInventory = inventoryData.length === pageSize;
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
    
    // ✅ FETCH ALL MACHINERY - Using proper pagination
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
      photoUrl: item.photo_url || ''
    })));
    
    // ✅ FETCH ALL SERVICE RECORDS - WITH SAFE ERROR HANDLING
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
    
    // ✅ SAFELY MAP SERVICE RECORDS WITH ERROR HANDLING PER RECORD
    const mappedServiceRecords = [];
    let skippedRecords = 0;
    
    for (const item of allServiceRecords) {
      try {
        // Try to parse photo data safely
        let photoUrls = [];
        
if (item.photo_urls) {
  try {
    // Try to parse as JSON array first
    photoUrls = JSON.parse(item.photo_urls);
  } catch (parseError) {
    // If JSON parse fails, it might be a raw base64 string or URL
    if (typeof item.photo_urls === 'string' && item.photo_urls.trim().length > 0) {
      // It's a string - treat it as a single photo
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
          photoUrl: payload.new.photo_url
        }]);
      } else if (payload.eventType === 'UPDATE') {
        setMachinery(prev => prev.map(item => item.id === payload.new.id ? {
          id: payload.new.id,
          name: payload.new.name,
          vinSerial: payload.new.vin_serial,
          category: payload.new.category,
          status: payload.new.status,
          photoUrl: payload.new.photo_url
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
  setRealtimeStatus('connected');
};

// Photo Upload Function with automatic compression - OPTIMIZED
const handlePhotoUpload = async (file, formType) => {
  if (!file) return null;

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (JPG, PNG, etc.)');
    return null;
  }

  setUploadingPhoto(true);

  try {
    // Create an image element to load the file
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl;
    });

    // Create canvas for compression
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

// ✅ LARGER for sharper photos
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;

    let width = img.width;
    let height = img.height;

    // Calculate new dimensions maintaining aspect ratio
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

    // Draw and compress
    ctx.drawImage(img, 0, 0, width, height);

// ✅ BALANCED: Better quality while still being reasonable size
const quality = 0.85; // Much better quality, still compressed
let base64Result = canvas.toDataURL('image/jpeg', quality);

    // ✅ ONLY ONE SIZE CHECK - no loop
    if (base64Result.length > 4 * 1024 * 1024) {
      // If too large, reduce dimensions more aggressively
      canvas.width = width * 0.6;
      canvas.height = height * 0.6;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      base64Result = canvas.toDataURL('image/jpeg', 0.5);
      
      if (base64Result.length > 4 * 1024 * 1024) {
        alert('Image is too large. Please try a smaller image or take a new photo.');
        setUploadingPhoto(false);
        URL.revokeObjectURL(objectUrl);
        return null;
      }
    }

    // Clean up
    URL.revokeObjectURL(objectUrl);
    setUploadingPhoto(false);

    const finalSizeMB = (base64Result.length / (1024 * 1024)).toFixed(2);
    console.log(`✅ Image compressed to ${finalSizeMB}MB at ${Math.round(quality * 100)}% quality`);

    return base64Result;

  } catch (error) {
    console.error('Image processing error:', error);
    alert('Failed to process image. Please try a different image.');
    setUploadingPhoto(false);
    return null;
  }
};
  
  const getStockStatus = (item) => {
    const qty = parseInt(item.quantity) || 0;
    const min = parseInt(item.minQuantity) || 0;
    const max = parseInt(item.maxQuantity) || Infinity;

    if (min > 0 && qty <= min) return 'low';
    if (max < Infinity && qty >= max) return 'high';
    return 'normal';
  };

  // Filter and sort functions
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
    // First apply machine filter if set
    if (serviceFilter && record.machineName !== serviceFilter) {
      return false;
    }
    
    // Then apply search filter
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
  if (uploadingPhoto) return;
  
  try {
    await supabase.from('inventory_items').insert([{
      id: Date.now().toString(),
      user_id: user.id,
      name: inventoryForm.name,
      part_number: inventoryForm.partNumber,
      quantity: inventoryForm.quantity,
      location: inventoryForm.location,
      min_quantity: inventoryForm.minQuantity,
      max_quantity: inventoryForm.maxQuantity,
      photo_url: inventoryForm.photoUrl || ''
    }]);
    
    console.log('✅ Inventory saved - FAST!');
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
    setShowInventoryModal(false);
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  }
};
  const deleteInventoryItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
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
    
    await supabase.from('inventory_items').update(updates).eq('id', id);

    // Mark this ID as recently updated to skip real-time event
    recentlyUpdatedIdsRef.current.add(id);
    
    // Remove from set after 2 seconds (safety cleanup)
    setTimeout(() => {
      recentlyUpdatedIdsRef.current.delete(id);
    }, 2000);

    // Update local state immediately
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

    console.log('✅ Inventory updated - FAST!');
    setEditingInventoryId(null);
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
} catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
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
      photo_url: machineryForm.photoUrl || ''
    };
    
    await supabase.from('machinery_items').insert([newItem]);
    
    // ✅ IMMEDIATELY update local state
    setMachinery(prev => [...prev, {
      id: newItem.id,
      name: newItem.name,
      vinSerial: newItem.vin_serial,
      category: newItem.category,
      status: newItem.status,
      photoUrl: newItem.photo_url
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
    // Delete the machine
    await supabase.from('machinery_items').delete().eq('id', id);
    
    // Delete related service records
    if (serviceCount > 0) {
      await supabase.from('service_records')
        .delete()
        .eq('machine_name', machineToDelete.name);
    }

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
      photoUrl: item.photoUrl || ''
    });
  };

const saveMachineryEdit = async (id) => {
  setSavingMachinery(true);
  try {
    const updates = {
      name: machineryForm.name,
      vin_serial: machineryForm.vinSerial,
      category: machineryForm.category,
      status: machineryForm.status,
      photo_url: machineryForm.photoUrl || ''
    };
    
    await supabase.from('machinery_items').update(updates).eq('id', id);

    // ✅ IMMEDIATELY update local state
    setMachinery(prev => prev.map(item => 
      item.id === id ? {
        id: item.id,
        name: updates.name,
        vinSerial: updates.vin_serial,
        category: updates.category,
        status: updates.status,
        photoUrl: updates.photo_url
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
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
  };
  
const viewMachineServiceHistory = (machineName) => {
  setServiceFilter(machineName);
  setServiceSearch('');
  setActiveTab('service');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  
const addServiceRecord = async () => {
  if (savingService) return;
  
  setSavingService(true);
  try {
    const finalDate = serviceForm.date || new Date().toISOString().split('T')[0];
    
    await supabase.from('service_records').insert([{
      id: Date.now().toString(),
      user_id: user.id,
      machine_name: serviceForm.machineName,
      service_type: serviceForm.serviceType,
      date: finalDate,
      notes: serviceForm.notes,
      technician: serviceForm.technician,
      photo_urls: JSON.stringify(serviceForm.photoUrls || [])
    }]);
    
    console.log('✅ Service saved - FAST!');
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
    await supabase.from('service_records').delete().eq('id', id);
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
    await supabase.from('service_records').update({
      machine_name: serviceForm.machineName,
      service_type: serviceForm.serviceType,
      date: serviceForm.date,
      notes: serviceForm.notes,
      technician: serviceForm.technician,
      photo_urls: JSON.stringify(serviceForm.photoUrls || [])
    }).eq('id', id);

    console.log('✅ Service updated - FAST!');
    setEditingServiceId(null);
    setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrls: [] });
    setMachineSearchModal('');
    setSavingService(false);
  } catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
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
};

const quickUpdateQuantity = async (id, delta) => {
  try {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(0, (parseInt(item.quantity) || 0) + delta).toString();
    
    await supabase.from('inventory_items').update({
      quantity: newQuantity
    }).eq('id', id);
    
    console.log('✅ Quantity updated - FAST!');
  } catch (error) {
    console.error('Update error:', error);
    alert('Error updating quantity: ' + error.message);
  }
};

  // Styles object - NOW USES currentTheme WHICH IS DEFINED
  const styles = {
    loginContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    },
loginCard: {
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '16px',
  padding: '48px',
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
      color: '#ef4444',
      fontSize: '0.875rem',
    },
container: {
  minHeight: '100vh',
  color: currentTheme.text,
  padding: '24px',
},
    homeContainer: {
      background: currentTheme.homeBackground,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '500px',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(5px)',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    loading: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #1a202c, #2d3748)',
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
      background: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
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
  background: '#10b981',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
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
  padding: '24px',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
    },
    editButton: {
      padding: '8px',
      background: '#0891b2',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      padding: '8px',
      background: '#7f1d1d',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
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
      width: '32px',
      height: '32px',
      background: '#10b981',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1.25rem',
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
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading AgriTrack...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={styles.loginTitle}>Welcome to</h2>
<h1 style={styles.title}>
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

            {loginError && (
              <div style={styles.loginError}>
                {loginError}
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

          <p style={styles.loginSubtitle}>created by Dahlton Ag Ventures</p>
        </div>

        <div style={styles.loginFooter}>
          powered by Vercel
        </div>
      </div>
    );
  }
// PART 4 - MAIN APP RETURN (Insert after login screen)
// This continues from: if (!user) { return ( ... login screen ... ); }

 return (
<div 
  key={theme}
  style={{
    minHeight: '100vh',
    color: currentTheme.text,
    padding: '24px',
    background: theme === 'dark' ? currentTheme.background : '#f3f4f6',
    backgroundImage: theme === 'dark' ? currentTheme.backgroundImage : 'repeating-radial-gradient(circle at 0 0, transparent 0, #f3f4f6 40px), repeating-linear-gradient(rgba(6, 182, 212, 0.03), rgba(16, 185, 129, 0.03))'
  }}
>
    <div style={styles.content}>
      <div style={styles.header}>
<div>
<h1 className="title-with-wrench" style={styles.title}>
  <Wrench className="wrench-icon" size={40} style={{ 
    display: 'inline-block', 
    verticalAlign: 'middle', 
    marginRight: '12px',
    color: '#06b6d4'
  }} />
  AgriTrack Manager
</h1>
  <p style={styles.subtitle}>Dahlton Ag Ventures</p>
<p style={styles.stats}>
  {loading ? (
    <>
      <span style={{ opacity: 0.6 }}>Loading data...</span>
    </>
  ) : (
    <>
      {inventory.length} Inventory • {machinery.length} Machines • {serviceHistory.length} Service Records
    </>
  )}
  {userRole && !loading && (
  userRole === 'employee' ? (
    <span style={{ 
      marginLeft: '12px', 
      padding: '4px 12px', 
      background: 'rgba(107, 114, 128, 0.2)',
      border: '1px solid #6b7280',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      {userRole}
    </span>
  ) : (
    <button
      onClick={() => setActiveTab('admin')}
      style={{ 
        marginLeft: '12px', 
        padding: '4px 12px', 
        background: activeTab === 'admin' ? 'linear-gradient(to right, #10b981, #06b6d4)' : 'rgba(16, 185, 129, 0.2)',
        border: `1px solid ${activeTab === 'admin' ? '#06b6d4' : '#10b981'}`,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: theme === 'dark' ? 'white' : '#1e40af',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
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
  )
)}
            </p>
          </div>
          <div style={styles.statusContainer}>
            {syncing && (
              <div style={styles.syncingBadge}>
                <RefreshCw size={12} style={{ animation: 'spin 0.6s linear infinite' }} />
                Syncing...
              </div>
            )}
{realtimeStatus === 'connected' && (
  <button onClick={() => setShowDebugModal(true)} style={{
    ...styles.statusBadge,
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    color: '#10b981'
  }}>
    <Users size={16} />
    Live Sync Active
  </button>
)}
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {lastSync && (
          <div style={styles.lastSyncBanner}>
            Last synced: {lastSync.toLocaleTimeString()}
          </div>
        )}

        <div style={styles.tabs}>
  {['home', 'inventory', 'machinery', 'service'].map(tab => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        ...styles.tab,
        background: activeTab === tab ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive
      }}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

{activeTab === 'home' && (
  <div style={styles.homeContainer}>
    {/* Welcome Header */}
    <div style={{ 
      ...styles.welcomeCard, 
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%)',
      border: '2px solid #10b981',
      marginBottom: '30px'
    }}>
      <h1 style={{ 
        color: currentTheme.text, 
        marginBottom: '16px', 
        fontSize: '2.5rem', 
        fontWeight: '700',
        textAlign: 'center',
        background: 'linear-gradient(to right, #10b981, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Welcome to AgriTrack Manager
      </h1>
      <p style={{ 
        color: currentTheme.text, 
        fontSize: '1.1rem', 
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.9
      }}>
        Track inventory, machinery, and service records all in one place
      </p>
    </div>

    {/* Featured Card: General Features */}
    <div style={{
      background: 'rgba(30, 58, 95, 0.6)',
      border: '2px solid #2563eb',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '24px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    className="feature-card"
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
      e.currentTarget.style.borderColor = '#10b981';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#2563eb';
    }}>
      {/* Card Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid rgba(37, 99, 235, 0.3)'
      }}>
        <span style={{ fontSize: '2rem' }}>👥</span>
        <h3 style={{ fontSize: '1.5rem', color: '#06b6d4', margin: 0 }}>General Features</h3>
      </div>

      {/* Card Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        color: '#d1d5db'
      }}>
        <div>
          <h4 style={{ color: '#10b981', marginBottom: '12px', fontSize: '1.1rem' }}>Real-Time Sync:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>All changes sync instantly across all devices - no manual refresh needed</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#10b981', marginBottom: '12px', fontSize: '1.1rem' }}>Search & Sort:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Every tab has powerful search and sorting options to find what you need</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#10b981', marginBottom: '12px', fontSize: '1.1rem' }}>Mobile Friendly:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Works perfectly on phones, tablets, and computers</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#10b981', marginBottom: '12px', fontSize: '1.1rem' }}>Import/Export:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Bulk import data from CSV files or export for backups via Settings</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Three Column Cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginBottom: '30px'
    }}>
      {/* Card 1: Inventory Management */}
      <div style={{
        background: 'rgba(30, 58, 95, 0.6)',
        border: '2px solid #2563eb',
        borderRadius: '16px',
        padding: '30px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      className="feature-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#2563eb';
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(37, 99, 235, 0.3)'
        }}>
          <span style={{ fontSize: '2rem' }}>📦</span>
          <h3 style={{ fontSize: '1.5rem', color: '#06b6d4', margin: 0 }}>Inventory Management</h3>
        </div>

        {/* Card Content */}
        <div style={{ color: '#d1d5db', lineHeight: '1.8' }}>
          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Add New Items:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Click "Add Item" to create inventory entries with photos, part numbers, and stock levels</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Edit Items:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Click the blue edit icon to modify item details, locations, or min/max quantities</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Quick Updates:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Use + and - buttons for fast quantity adjustments</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Stock Alerts:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Set min/max quantities to get automatic low stock and overstock warnings</li>
          </ul>
        </div>
      </div>

      {/* Card 2: Machinery Tracking */}
      <div style={{
        background: 'rgba(30, 58, 95, 0.6)',
        border: '2px solid #2563eb',
        borderRadius: '16px',
        padding: '30px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      className="feature-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#2563eb';
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(37, 99, 235, 0.3)'
        }}>
          <span style={{ fontSize: '2rem' }}>🚜</span>
          <h3 style={{ fontSize: '1.5rem', color: '#06b6d4', margin: 0 }}>Machinery Tracking</h3>
        </div>

        {/* Card Content */}
        <div style={{ color: '#d1d5db', lineHeight: '1.8' }}>
          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Add Machines:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Click "Add Machine" to register new equipment with photos and VIN/serial numbers</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Categorize:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Organize equipment by type (tractors, combines, sprayers, etc.)</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            View Service History:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Click the purple "Services" button to jump to that machine's maintenance records</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Edit Records:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Update machine information, categories, or add photos anytime</li>
          </ul>
        </div>
      </div>

      {/* Card 3: Service History */}
      <div style={{
        background: 'rgba(30, 58, 95, 0.6)',
        border: '2px solid #2563eb',
        borderRadius: '16px',
        padding: '30px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      className="feature-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
        e.currentTarget.style.borderColor = '#10b981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#2563eb';
      }}>
        {/* Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid rgba(37, 99, 235, 0.3)'
        }}>
          <span style={{ fontSize: '2rem' }}>🔧</span>
          <h3 style={{ fontSize: '1.5rem', color: '#06b6d4', margin: 0 }}>Service History</h3>
        </div>

        {/* Card Content */}
        <div style={{ color: '#d1d5db', lineHeight: '1.8' }}>
          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Log Services:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Click "Add Service Record" and select a machine from the dropdown menu</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Add Details:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Include service type, date, technician names, and detailed notes</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Attach Photos:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Upload service photos or receipts for complete documentation</li>
          </ul>

          <h4 style={{ color: '#10b981', marginTop: '16px', marginBottom: '12px', fontSize: '1.1rem' }}>
            Export Data:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>Generate reports and export service history via Settings</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Stats Footer */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '30px'
    }}>
      <div style={{
        background: 'rgba(6, 182, 212, 0.15)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Total Inventory</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
          {loading ? '...' : inventory.length}
        </p>
      </div>
      <div style={{
        background: 'rgba(6, 182, 212, 0.15)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Total Machinery</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
          {loading ? '...' : machinery.length}
        </p>
      </div>
      <div style={{
        background: 'rgba(6, 182, 212, 0.15)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Service Records</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
          {loading ? '...' : serviceHistory.length}
        </p>
      </div>
    </div>
  </div>
)}

    {/* Quick Stats Footer */}
   <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginTop: '24px'
}}>
  <div style={{
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  }}>
    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Total Inventory</p>
    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
      {loading ? '...' : inventory.length}
    </p>
  </div>
  <div style={{
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  }}>
    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Total Machinery</p>
    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
      {loading ? '...' : machinery.length}
    </p>
  </div>
  <div style={{
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  }}>
    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Service Records</p>
    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
      {loading ? '...' : serviceHistory.length}
        </p>
      </div>
    </div>
  </div>
)}
     
  {activeTab === 'inventory' && (
  <div>
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
    e.target.style.background = '#059669';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.target.style.background = '#10b981';
  }}
>
  <Plus size={20} /> Add Item
</button>
      )}
    </div>

    <div style={styles.searchSortContainer}>
      <input
        type="text"
        placeholder="🔍 Search inventory (name, part number, location)..."
        value={inventorySearch}
        onChange={(e) => {
          setInventorySearch(e.target.value);
          setInventoryPage(1);
        }}
        style={styles.searchInput}
      />
      <select
        value={inventorySort}
        onChange={(e) => {
          setInventorySort(e.target.value);
          setInventoryPage(1);
        }}
        style={styles.sortSelect}
      >
        <option value="name-asc">Name (A → Z)</option>
        <option value="name-desc">Name (Z → A)</option>
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
        style={styles.sortSelect}
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
                background: inventoryPage === 1 ? '#4b5563' : '#10b981',
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
                background: inventoryPage === 1 ? '#4b5563' : '#10b981',
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
                background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : '#10b981',
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
                background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : '#10b981',
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
              <div key={item.id} className="item-card" style={styles.itemCard}>
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
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
                  </div>
                </div>
              ) : (
                <>
                {item.photoUrl && (
  <div style={{ position: 'relative', marginRight: '16px' }}>
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem' }}>{item.name}</h3>
                    {getStockStatus(item) === 'low' && (
  <span className="stock-badge-low" style={styles.stockBadgeLow}>⚠️ Low Stock</span>
)}
                      {getStockStatus(item) === 'high' && (
                        <span style={styles.stockBadgeHigh}>⚠️ Overstocked</span>
                      )}
                    </div>
                    <div style={styles.itemDetails}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Part Number</p>
                        <p>{item.partNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Quantity</p>
                        {userRole === 'employee' ? (
                          <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.quantity || 0}</p>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => quickUpdateQuantity(item.id, -1)}
                              style={styles.quantityButton}
                            >
                              −
                            </button>
                            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.quantity || 0}</p>
                            <button 
                              onClick={() => quickUpdateQuantity(item.id, 1)}
                              style={styles.quantityButton}
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {userRole !== 'employee' && (
                      <button onClick={() => startEditInventory(item)} style={styles.editButton}>
                        <Edit2 size={16} />
                      </button>
                    )}
                    {userRole !== 'employee' && (
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
                    )}
                  </div>
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
              background: inventoryPage === 1 ? '#4b5563' : '#10b981',
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
              background: inventoryPage === 1 ? '#4b5563' : '#10b981',
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
              background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : '#10b981',
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
              background: inventoryPage === getPaginatedInventory().totalPages ? '#4b5563' : '#10b981',
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
            <div style={styles.tabHeader}>
              <h2 style={{ fontSize: '1.5rem' }}>Machinery</h2>
              {userRole !== 'employee' && (
<button 
  onClick={() => {
    setShowMachineryModal(true);
  }} 
  style={styles.addButton}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
    e.target.style.background = '#059669';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.target.style.background = '#10b981';
  }}
>
  <Plus size={20} /> Add Machine
</button>
              )}
            </div>

            <div style={styles.searchSortContainer}>
  <input
    type="text"
    placeholder="🔍 Search machinery (name, VIN/serial, category)..."
    value={machinerySearch}
    onChange={(e) => {
      setMachinerySearch(e.target.value);
      setMachineryPage(1);
    }}
    style={styles.searchInput}
  />
  <select
    value={machinerySort}
    onChange={(e) => {
      setMachinerySort(e.target.value);
      setMachineryPage(1);
    }}
    style={styles.sortSelect}
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
    style={styles.sortSelect}
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
            background: machineryPage === 1 ? '#4b5563' : '#10b981',
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
            background: machineryPage === 1 ? '#4b5563' : '#10b981',
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
            background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : '#10b981',
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
            background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : '#10b981',
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
        <div key={item.id} className="item-card" style={styles.itemCard}>
          {editingMachineryId === item.id ? (
            <div style={{ flex: 1 }}>
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
                style={styles.input}
                value={machineryForm.category}
                onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
              >
                <option value="">Select Category...</option>
                {MACHINERY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
              {item.photoUrl && (
  <div style={{ position: 'relative', marginRight: '16px' }}>
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
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{item.name}</h3>
                <div style={styles.itemDetails}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>VIN/Serial</p>
                    <p>{item.vinSerial || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Category</p>
                    <p>{item.category || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => viewMachineServiceHistory(item.name)} 
                  style={{
                    ...styles.editButton,
                    background: '#8b5cf6',
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
          background: machineryPage === 1 ? '#4b5563' : '#10b981',
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
          background: machineryPage === 1 ? '#4b5563' : '#10b981',
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
          background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : '#10b981',
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
          background: machineryPage === getPaginatedMachinery().totalPages ? '#4b5563' : '#10b981',
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
</div>
)}
{activeTab === 'service' && (
          <div>
            <div style={styles.tabHeader}>
  <div>
    <h2 style={{ fontSize: '1.5rem' }}>Service Records</h2>
{serviceFilter && (() => {
  const filteredCount = serviceHistory.filter(r => r.machineName === serviceFilter).length;
  
  // Show banner with appropriate message
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(139, 92, 246, 0.2)',
        border: '1px solid #8b5cf6',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#a78bfa'
      }}>
        <AlertCircle size={16} />
        {filteredCount === 0 ? (
          <>No records exist for <strong>{serviceFilter}</strong></>
        ) : (
          <>Showing {filteredCount} record{filteredCount === 1 ? '' : 's'} for <strong>{serviceFilter}</strong></>
        )}
        <button
          onClick={() => setServiceFilter('')}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          Clear Filter
        </button>
      </div>
      
      {/* ✅ NEW: Add One button - only show when no records exist and user is not an employee */}
      {filteredCount === 0 && userRole !== 'employee' && (
        <button
          onClick={() => {
            setServiceForm({ 
              machineName: serviceFilter, 
              serviceType: '', 
              date: '', 
              notes: '', 
              technician: '', 
              photoUrl: '' 
            });
            setShowServiceModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#059669';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#10b981';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          <Plus size={16} />
          Add one
        </button>
      )}
    </div>
  );
})()}
  </div>
  {userRole !== 'employee' && (
  <button 
    onClick={() => {
      setShowServiceModal(true);
    }} 
    style={{
      padding: '12px 24px',
      background: '#10b981',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
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
      e.target.style.background = '#059669';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      e.target.style.background = '#10b981';
    }}
  >
    <Plus size={20} /> Add Service Record
  </button>
)}
</div>
<div style={styles.searchSortContainer}>
  <input
    type="text"
    placeholder="🔍 Search service records (machine, service type, technician, notes)..."
    value={serviceSearch}
    onChange={(e) => {
      setServiceSearch(e.target.value);
      setServicePage(1);
    }}
    style={styles.searchInput}
  />
  <select
    value={serviceSort}
    onChange={(e) => {
      setServiceSort(e.target.value);
      setServicePage(1);
    }}
    style={styles.sortSelect}
  >
    <option value="date-desc">Date (Newest First)</option>
    <option value="date-asc">Date (Oldest First)</option>
  </select>
  <select
    value={serviceItemsPerPage}
    onChange={(e) => {
      setServiceItemsPerPage(Number(e.target.value));
      setServicePage(1);
    }}
    style={styles.sortSelect}
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
            background: servicePage === 1 ? '#4b5563' : '#10b981',
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
            background: servicePage === 1 ? '#4b5563' : '#10b981',
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
            background: servicePage === getPaginatedService().totalPages ? '#4b5563' : '#10b981',
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
            background: servicePage === getPaginatedService().totalPages ? '#4b5563' : '#10b981',
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
              <div key={record.id} className="item-card" style={styles.itemCard}>
{editingServiceId === record.id ? (
  <div style={{ flex: 1 }}>
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
        Select Machine
      </label>
      
      {/* ✅ SEARCH INPUT */}
      <input
        type="text"
        placeholder="🔍 Search machines..."
        value={machineSearchModal}
        onChange={(e) => setMachineSearchModal(e.target.value)}
        style={{
          ...styles.input,
          marginBottom: '8px'
        }}
      />
      
      {/* ✅ FILTERED DROPDOWN */}
      <select
        style={styles.input}
        value={serviceForm.machineName}
        onChange={(e) => setServiceForm({ ...serviceForm, machineName: e.target.value })}
        required
      >
        <option value="">-- Select a machine --</option>
        {machinery
          .filter(machine => {
            const searchLower = machineSearchModal.toLowerCase();
            return (
              machine.name?.toLowerCase().includes(searchLower) ||
              machine.category?.toLowerCase().includes(searchLower) ||
              machine.vinSerial?.toLowerCase().includes(searchLower)
            );
          })
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          .map(machine => (
            <option key={machine.id} value={machine.name}>
              {machine.name} {machine.category ? `(${machine.category})` : ''}
            </option>
          ))}
      </select>
      
      {/* ✅ SHOW COUNT OF FILTERED RESULTS */}
      {machineSearchModal && (
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>
          Showing {machinery.filter(m => {
            const searchLower = machineSearchModal.toLowerCase();
            return (
              m.name?.toLowerCase().includes(searchLower) ||
              m.category?.toLowerCase().includes(searchLower) ||
              m.vinSerial?.toLowerCase().includes(searchLower)
            );
          }).length} of {machinery.length} machines
        </p>
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
                        <input
                          style={styles.input}
                          type="date"
                          placeholder="Date"
                          value={serviceForm.date}
                          onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
                        />
                        <input
                          style={styles.input}
                          placeholder="Technician"
                          value={serviceForm.technician}
                          onChange={(e) => setServiceForm({ ...serviceForm, technician: e.target.value })}
                        />
                        <textarea
                          style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
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
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
{record.photoUrls && record.photoUrls.length > 0 && (
  <div style={{ 
    marginRight: '16px',
    maxWidth: '300px'
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: record.photoUrls.length === 1 
        ? '1fr' 
        : 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '8px'
    }}>
      {record.photoUrls.map((url, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <img 
            src={url} 
            alt={`Service photo ${index + 1}`}
            style={{ 
              width: '100%', 
              height: record.photoUrls.length === 1 ? '120px' : '100px',
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
              setViewingImage(url);
              setImageModalTitle(`${record.machineName} - ${record.serviceType} (${index + 1}/${record.photoUrls.length})`);
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
                if (confirm('Remove this photo from the service record?')) {
                  try {
                    const updatedPhotos = record.photoUrls.filter((_, i) => i !== index);
                    await supabase.from('service_records').update({
                      photo_urls: JSON.stringify(updatedPhotos)
                    }).eq('id', record.id);
                    
                    setServiceHistory(prev => prev.map(r => 
                      r.id === record.id ? { ...r, photoUrls: updatedPhotos } : r
                    ));
                    
                    console.log('✅ Photo removed from service record');
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
      ))}
    </div>
    <p style={{ 
      color: '#9ca3af', 
      fontSize: '0.75rem', 
      marginTop: '4px',
      textAlign: 'center'
    }}>
      {record.photoUrls.length} photo{record.photoUrls.length !== 1 ? 's' : ''}
    </p>
  </div>
)}
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{record.machineName}</h3>
                              <p style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '12px' }}>{record.serviceType}</p>
                              <div style={styles.itemDetails}>
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
                                <div style={{ marginTop: '12px', padding: '12px', background: '#1f2937', borderRadius: '8px' }}>
                                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Notes:</p>
                                  <p style={{ fontSize: '0.875rem' }}>{record.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {userRole !== 'employee' && (
                            <button onClick={() => startEditService(record)} style={styles.editButton}>
                              <Edit2 size={16} />
                            </button>
                          )}
                          {userRole !== 'employee' && (
                            <button onClick={() => deleteServiceRecord(record.id)} style={styles.deleteButton}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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
                    background: servicePage === 1 ? '#4b5563' : '#10b981',
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
                    background: servicePage === 1 ? '#4b5563' : '#10b981',
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
                    background: servicePage === getPaginatedService().totalPages ? '#4b5563' : '#10b981',
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
                    background: servicePage === getPaginatedService().totalPages ? '#4b5563' : '#10b981',
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
                  </div>
                </div>
              )}

              {activeSettingsSection === 'account' && (
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
                        <p style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
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
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => {
                          const csv = [
                            ['Name', 'Part Number', 'Quantity', 'Location', 'Category', 'Min Qty', 'Max Qty'].join(','),
                            ...inventory.map(item => [
                              item.name,
                              item.partNumber,
                              item.quantity,
                              item.location,
                              item.category,
                              item.minQuantity,
                              item.maxQuantity
                            ].join(','))
                          ].join('\n');
                          
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'inventory.csv';
                          a.click();
                        }}
                        style={styles.primaryButton}
                      >
                        Export Inventory to CSV
                      </button>
                      <button 
                        onClick={() => {
                          const csv = [
                            ['Name', 'VIN/Serial', 'Category', 'Status'].join(','),
                            ...machinery.map(item => [
                              item.name,
                              item.vinSerial,
                              item.category,
                              item.status
                            ].join(','))
                          ].join('\n');
                          
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'machinery.csv';
                          a.click();
                        }}
                        style={styles.primaryButton}
                      >
                        Export Machinery to CSV
                      </button>
                     <button 
  onClick={() => {
    const csv = [
      ['Machine', 'Service Type', 'Date', 'Technician', 'Notes'].join(','),  // removed Cost
      ...serviceHistory.map(record => [
        record.machineName,
        record.serviceType,
        record.date,
        record.technician,
        record.notes
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-records.csv';
    a.click();
  }}
  style={styles.primaryButton}
>
  Export Service Records to CSV
</button>
                      <button 
                        onClick={async () => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv';
                          input.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const text = await file.text();
                            const rows = text.split('\n').slice(1);
                            const newInventory = rows
                              .filter(row => row.trim())
                              .map((row, index) => {
                                const [name, partNumber, quantity, location, category, minQuantity, maxQuantity] = row.split(',');
                                return {
                                  id: Date.now() + index,
                                  name: name?.trim() || '',
                                  partNumber: partNumber?.trim() || '',
                                  quantity: quantity?.trim() || '',
                                  location: location?.trim() || '',
                                  category: category?.trim() || '',
                                  minQuantity: minQuantity?.trim() || '',
                                  maxQuantity: maxQuantity?.trim() || '',
                                };
                              });
                            
                            const { error } = await supabase
                              .from('agritrack_data')
                              .update({ inventory: [...inventory, ...newInventory] })
                              .eq('id', 1);
                            
                            if (error) {
                              alert('Error importing: ' + error.message);
                            } else {
                              alert(`Successfully imported ${newInventory.length} items!`);
                              loadData();
                            }
                          };
                          input.click();
                        }}
                        style={{...styles.secondaryButton, background: '#0891b2'}}
                      >
                        Import Inventory from CSV
                      </button>
                      <button 
                        onClick={async () => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.csv';
                          input.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const text = await file.text();
                            const rows = text.split('\n').slice(1);
                            const newMachinery = rows
                              .filter(row => row.trim())
                              .map((row, index) => {
                                const [name, vinSerial, category, status] = row.split(',');
                                return {
                                  id: Date.now() + index,
                                  name: name?.trim() || '',
                                  vinSerial: vinSerial?.trim() || '',
                                  category: category?.trim() || '',
                                  status: status?.trim() || 'Active',
                                };
                              });
                            
                            const { error } = await supabase
                              .from('agritrack_data')
                              .update({ machinery: [...machinery, ...newMachinery] })
                              .eq('id', 1);
                            
                            if (error) {
                              alert('Error importing: ' + error.message);
                            } else {
                              alert(`Successfully imported ${newMachinery.length} machines!`);
                              loadData();
                            }
                          };
                          input.click();
                        }}
                        style={{...styles.secondaryButton, background: '#0891b2'}}
                      >
                        Import Machinery from CSV
                      </button>
  <button 
  onClick={async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const text = await file.text();
      const rows = text.split('\n').slice(1);
      const newRecords = rows
        .filter(row => row.trim())
        .map((row, index) => {
          const [machineName, serviceType, date, technician, notes] = row.split(',');  // removed cost
          return {
            id: Date.now() + index,
            machineName: machineName?.trim() || '',
            serviceType: serviceType?.trim() || '',
            date: date?.trim() || '',
            technician: technician?.trim() || '',
            notes: notes?.trim() || '',
          };
        });
      
      const { error } = await supabase
        .from('agritrack_data')
        .update({ service_history: [...serviceHistory, ...newRecords] })
        .eq('id', 1);
      
      if (error) {
        alert('Error importing: ' + error.message);
      } else {
        alert(`Successfully imported ${newRecords.length} service records!`);
        loadData();
      }
    };
    input.click();
  }}
  style={{...styles.secondaryButton, background: '#0891b2'}}
>
                        Import Service Records from CSV
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: currentTheme.cardBackground,
                  border: `1px solid ${currentTheme.cardBorder}`,
                  borderRadius: '12px'
                }}
              >
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
                  AgriTrack Manager v2.0 • Created by Dahlton Ag Ventures • Powered by Vercel
                </p>
              </div>
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
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid #10b981',
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
                  Administrative Access & Permissions
                </h3>
                <p style={{ color: currentTheme.textSecondary, marginBottom: '24px', fontSize: '1rem' }}>
                  As an administrator, you have full control over AgriTrack Manager. Below is a comparison of what you can do versus what employees can access.
                </p>
              </div>
            </div>

            {/* Permissions Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              
              {/* Admin Permissions Card */}
              <div style={styles.itemCard}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    marginBottom: '16px',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ✅ Admin / Manager Permissions
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>📦 Inventory</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>Add new inventory items</li>
                      <li>Edit item details and locations</li>
                      <li>Delete inventory items</li>
                      <li>Adjust quantities with +/- buttons</li>
                      <li>Set min/max stock alerts</li>
                      <li>Upload and manage photos</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🚜 Machinery</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>Add new machines</li>
                      <li>Edit machine details</li>
                      <li>Delete machines (and their service records)</li>
                      <li>View service history</li>
                      <li>Upload and manage photos</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🔧 Service Records</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>Create new service records</li>
                      <li>Edit existing records</li>
                      <li>Delete service records</li>
                      <li>Attach photos and files</li>
                      <li>Export service history</li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⚙️ Settings Access</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>Full Settings tab access</li>
                      <li>Import/Export CSV data</li>
                      <li>Change theme (Dark/Light mode)</li>
                      <li>View application info</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Employee Permissions Card */}
              <div style={styles.itemCard}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    marginBottom: '16px',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    👁️ Employee Permissions (View Only)
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>📦 Inventory</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>✅ View all inventory items</li>
                      <li>✅ Search and filter items</li>
                      <li>✅ See stock levels and alerts</li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot add items</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot edit items</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot delete items</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot adjust quantities</span></li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🚜 Machinery</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>✅ View all machinery</li>
                      <li>✅ Search and filter machines</li>
                      <li>✅ View service history</li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot add machines</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot edit machines</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot delete machines</span></li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>🔧 Service Records</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>✅ View all service records</li>
                      <li>✅ Search and filter records</li>
                      <li>✅ View attached photos</li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot create records</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot edit records</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot delete records</span></li>
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '8px' }}>⚙️ Settings Access</h4>
                    <ul style={{ paddingLeft: '20px', color: currentTheme.text, lineHeight: '1.8' }}>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>No Settings tab access</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot import/export data</span></li>
                      <li>❌ <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Cannot change theme</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Differences Highlight */}
            <div style={{
              ...styles.itemCard,
              marginTop: '24px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf6'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#a78bfa' }}>
                  💡 Key Takeaway
                </h3>
                <p style={{ color: currentTheme.text, lineHeight: '1.8' }}>
                  <strong>Employees have read-only access</strong> to all data, allowing them to view and search everything but not make changes. 
                  As an admin, you have full control to add, edit, and delete all records across the entire system. 
                  This ensures data integrity while giving your team the information they need.
                </p>
              </div>
            </div>
          </div>
        )}
{showInventoryModal && (
  <Modal title="Add Inventory Item" onClose={() => {
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
      opacity: uploadingPhoto ? 0.5 : 1,
      cursor: uploadingPhoto ? 'not-allowed' : 'pointer'
    }}
    disabled={uploadingPhoto}
  >
    {uploadingPhoto ? 'Uploading Photo...' : 'Add Item'}
  </button>
  <button onClick={() => setShowInventoryModal(false)} style={styles.secondaryButton}>Cancel</button>
</div>
          </Modal>
        )}

{showMachineryModal && (
  <Modal title="Add Machinery" onClose={() => {
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
              style={styles.input}
              value={machineryForm.category}
              onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
            >
              <option value="">Select Category...</option>
              {MACHINERY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
<Modal title="Add Service Record" onClose={() => {
  setShowServiceModal(false);
  setMachineSearchModal('');
  isEditingRef.current = false;
}}>
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
        Select Machine
      </label>
      
      {/* ✅ SEARCH INPUT */}
      <input
        type="text"
        placeholder="🔍 Search machines..."
        value={machineSearchModal}
        onChange={(e) => setMachineSearchModal(e.target.value)}
        style={{
          ...styles.input,
          marginBottom: '8px'
        }}
      />
      
      {/* ✅ FILTERED DROPDOWN */}
      <select
        style={styles.input}
        value={serviceForm.machineName}
        onChange={(e) => setServiceForm({ ...serviceForm, machineName: e.target.value })}
        required
      >
        <option value="">-- Select a machine --</option>
        {machinery
          .filter(machine => {
            const searchLower = machineSearchModal.toLowerCase();
            return (
              machine.name?.toLowerCase().includes(searchLower) ||
              machine.category?.toLowerCase().includes(searchLower) ||
              machine.vinSerial?.toLowerCase().includes(searchLower)
            );
          })
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          .map(machine => (
            <option key={machine.id} value={machine.name}>
              {machine.name} {machine.category ? `(${machine.category})` : ''}
            </option>
          ))}
      </select>
      
      {/* ✅ SHOW COUNT OF FILTERED RESULTS */}
      {machineSearchModal && (
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>
          Showing {machinery.filter(m => {
            const searchLower = machineSearchModal.toLowerCase();
            return (
              m.name?.toLowerCase().includes(searchLower) ||
              m.category?.toLowerCase().includes(searchLower) ||
              m.vinSerial?.toLowerCase().includes(searchLower)
            );
          }).length} of {machinery.length} machines
        </p>
      )}
    </div>
    <input
      style={styles.input}
      placeholder="Service Type (e.g., Oil Change, Repair, Inspection)"
      value={serviceForm.serviceType}
      onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
    />
<input
  style={styles.input}
  type="date"
  value={serviceForm.date}
  onChange={(e) => {
    setServiceForm({ ...serviceForm, date: e.target.value });
  }}
/>
    <input
      style={styles.input}
      placeholder="Technician Name"
      value={serviceForm.technician}
      onChange={(e) => setServiceForm({ ...serviceForm, technician: e.target.value })}
    />
    <textarea
      style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
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
          <Modal title="System Status" onClose={() => setShowDebugModal(false)}>
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
{/* Zoomable Image Viewer Modal */}
       {viewingImage && <ZoomableImageViewer 
          imageUrl={viewingImage} 
          title={imageModalTitle} 
          onClose={() => setViewingImage(null)}
          theme={currentTheme}
        />}
<style>{`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
    border-color: #10b981;
  }
  .stock-badge-low {
    animation: pulse 2s ease-in-out infinite;
  }
  .wrench-icon {
    transition: transform 0.6s ease;
  }
  .title-with-wrench:hover .wrench-icon {
    transform: rotate(360deg);
  }
`}</style>
      </div>
    </div>
  );
}

// Zoomable Image Viewer Component
function ZoomableImageViewer({ imageUrl, title, onClose, theme }) {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = React.useState(null);
  const imageContainerRef = React.useRef(null);
  const overlayRef = React.useRef(null);
  const animationFrameRef = React.useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setScale(prevScale => {
        const delta = -e.deltaY;
        const sensitivity = 0.002;
        const zoomFactor = 1 + (delta * sensitivity);
        
        const newScale = prevScale * zoomFactor;
        const clampedScale = Math.min(Math.max(1, newScale), 5);
        
        if (clampedScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        
        return clampedScale;
      });
    });
  };

  const handleMouseDown = (e) => {
    if (scale > 1 && (e.target.tagName === 'IMG' || e.target === imageContainerRef.current)) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      e.stopPropagation();
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      const scaleChange = newDistance / lastTouchDistance;
      
      setScale(prevScale => {
        const newScale = Math.min(Math.max(1, prevScale * scaleChange), 5);
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
      
      setLastTouchDistance(newDistance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setLastTouchDistance(null);
    setIsDragging(false);
  };

  const handleDoubleClick = (e) => {
    if (e.target.tagName === 'IMG' || e.target === imageContainerRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      if (scale === 1) {
        setScale(2);
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const zoomIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(prevScale => Math.min(prevScale + 0.5, 5));
  };

  const zoomOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(prevScale => {
      const newScale = Math.max(prevScale - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const resetZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragStart, position]);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={overlayRef}
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
        padding: '24px',
        zIndex: 100,
        overflow: 'hidden'
      }}
      onClick={handleOverlayClick}
    >
      {/* Title Bar */}
<div 
        style={{
          background: theme.cardBackground,
          padding: '8px 12px',
          borderRadius: '12px',
          marginBottom: '12px',   
          maxWidth: '90%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
          zIndex: 102
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: '0.875rem', color: theme.text }}>{title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            fontWeight: 'bold'
          }}
        >
          Close ✕
        </button>
      </div>

{/* Zoom Controls */}
      <div 
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: theme.cardBackground,
          padding: '8px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          zIndex: 102,
          pointerEvents: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={scale <= 1}
          style={{
            width: '32px',
            height: '32px',
            background: scale <= 1 ? '#6b7280' : '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: scale <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (scale > 1) e.target.style.background = '#059669';
          }}
          onMouseLeave={(e) => {
            if (scale > 1) e.target.style.background = '#10b981';
          }}
        >
          −
        </button>
        
        <div style={{
          color: theme.text,
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '4px 8px',
          fontWeight: 'bold',
          minWidth: '60px'
        }}>
          {Math.round(scale * 100)}%
        </div>
        
        <button
          onClick={zoomIn}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={scale >= 5}
          style={{
            width: '32px',
            height: '32px',
            background: scale >= 5 ? '#6b7280' : '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: scale >= 5 ? 'not-allowed' : 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (scale < 5) e.target.style.background = '#059669';
          }}
          onMouseLeave={(e) => {
            if (scale < 5) e.target.style.background = '#10b981';
          }}
        >
          +
        </button>
        
        <button
          onClick={resetZoom}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={scale === 1}
          style={{
            width: '32px',
            height: '32px',
            background: scale === 1 ? '#6b7280' : '#2563eb',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: scale === 1 ? 'not-allowed' : 'pointer',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          title="Reset zoom"
          onMouseEnter={(e) => {
            if (scale !== 1) e.target.style.background = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (scale !== 1) e.target.style.background = '#2563eb';
          }}
        >
          ⟲
        </button>
      </div>

      {/* Zoomable Image Container */}
      <div
        ref={imageContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: scale > 1 
            ? (isDragging ? 'grabbing' : 'grab') 
            : 'zoom-in',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto',
          width: '100%',
          position: 'relative'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Zoomable view"
          style={{
            maxWidth: '90vw',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitUserDrag: 'none'
          }}
          draggable="false"
        />
      </div>
    </div>
  );
}

// Modal component - defined outside to avoid recreation on each render
function Modal({ children, onClose, title }) {
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
      background: '#1e3a5f',
      border: '1px solid #2563eb',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      color: 'white',
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
