
// BUILD VERSION: 2025-01-21-v2-FIXED
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Truck, Users, AlertCircle, RefreshCw, Edit2, Save, X, LogOut, ChevronDown, Wrench } from 'lucide-react';

// Theme configurations
const themes = {
  dark: {
    background: '#111827',
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
    machineName: '', serviceType: '', date: '', notes: '', technician: ''
  });

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    console.log('📥 Loading data from Supabase...');
    setLoading(true);
    
    const { data, error } = await supabase
      .from('agritrack_data')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    if (data) {
      console.log('✅ Data loaded');
      console.log('📦 Inventory array length:', data.inventory?.length); // ADD THIS
      console.log('📦 First 3 items:', data.inventory?.slice(0, 3)); // ADD THIS
      
      setInventory(data.inventory || []);
      setMachinery(data.machinery || []);
      setServiceHistory(data.service_history || []);
      setLastSync(new Date());
    }
  } catch (error) {
    console.error('❌ Load error:', error);
    alert('Failed to load data. Please refresh the page.');
  } finally {
    setLoading(false);
  }
};

 const setupRealtime = () => {
  console.log('🔔 Setting up real-time subscription...');

  const channel = supabase
    .channel('agritrack-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'agritrack_data',
        filter: 'id=eq.1'
      },
      (payload) => {
        console.log('🔔 Real-time update received!', payload);
        
        // ✅ BLOCK: Don't apply updates if user is actively editing OR recent local change
        const now = Date.now();
        const timeSinceLastUpdate = now - lastLocalUpdateRef.current;
        
        if (isEditingRef.current) {
          console.log('⏸️ Skipping real-time update (user is editing)');
          return;
        }
        
        if (timeSinceLastUpdate <= 5000) {
          console.log('⏸️ Skipping real-time update (recent local change)');
          return;
        }
        
        if (payload.new) {
          console.log('✅ Applying real-time update');
          setInventory(payload.new.inventory || []);
          setMachinery(payload.new.machinery || []);
          setServiceHistory(payload.new.service_history || []);
          setLastSync(new Date());
          setRealtimeStatus('connected');
        }
      }
    )
    .subscribe((status) => {
      console.log('🔔 Real-time status:', status);
      if (status === 'SUBSCRIBED') {
        setRealtimeStatus('connected');
        console.log('✅ Real-time subscription active!');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setRealtimeStatus('error');
      }
    });
};

// Photo Upload Function with automatic compression
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

      // Maximum dimensions (adjust these as needed)
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

      // Convert to base64 with compression
      // Start with 0.7 quality, reduce if still too large
      let quality = 0.7;
      let base64Result = canvas.toDataURL('image/jpeg', quality);

      // If still over 3MB as base64, reduce quality further
      while (base64Result.length > 3 * 1024 * 1024 && quality > 0.3) {
        quality -= 0.1;
        base64Result = canvas.toDataURL('image/jpeg', quality);
      }

      // Final check - if STILL too large, try even more aggressive compression
      if (base64Result.length > 4 * 1024 * 1024) {
        // Try reducing dimensions even more
        canvas.width = width * 0.7;
        canvas.height = height * 0.7;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        base64Result = canvas.toDataURL('image/jpeg', 0.5);
        
        if (base64Result.length > 4 * 1024 * 1024) {
          alert('Image is extremely large and could not be compressed enough. Please try a different image.');
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
  
  // Check inventory stock levels
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
  lastLocalUpdateRef.current = Date.now();
  
  try {
    // ✅ FETCH ALL CURRENT DATA FROM DATABASE FIRST
    const { data: currentData, error: fetchError } = await supabase
      .from('agritrack_data')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentInventory = currentData?.inventory || [];
    const currentMachinery = currentData?.machinery || [];
    const currentServiceHistory = currentData?.service_history || [];
    
    const newItem = { ...inventoryForm, id: Date.now() };
    const newInventory = [...currentInventory, newItem];

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setInventory(newInventory);
    setMachinery(currentMachinery);
    setServiceHistory(currentServiceHistory);
    
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
    setShowInventoryModal(false);

    // ✅ NOW SAVE BACK TO DATABASE
    const { error } = await supabase
      .from('agritrack_data')
      .update({ 
        inventory: newInventory,
        machinery: currentMachinery,
        service_history: currentServiceHistory
      })
      .eq('id', 1);
    
    if (error) throw error;
    console.log('✅ Inventory item added successfully');
    
    // ✅ Clear editing flag AFTER successful save with delay
setTimeout(() => {
  console.log('🔓 Unlocking real-time sync');
  isEditingRef.current = false;
}, 3000);
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
    isEditingRef.current = false;
    // ❌ ROLLBACK ON ERROR
    loadData();
  }
};
  const deleteInventoryItem = async (id) => {
  const shouldDelete = window.confirm('Are you sure you want to delete this item?');
  if (!shouldDelete) return;

  try {
    lastLocalUpdateRef.current = Date.now(); // ✅ ADD THIS LINE
    
    const newInventory = inventory.filter(item => item.id !== id);
    
    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setInventory(newInventory);

    const { error } = await supabase
      .from('agritrack_data')
      .update({ inventory: newInventory })
      .eq('id', 1);

    if (error) throw error;
    console.log('✅ Item deleted successfully');
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    alert('Failed to delete item. Please try again.');
    // ❌ ROLLBACK ON ERROR
    loadData();
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
  try {
    lastLocalUpdateRef.current = Date.now(); // ✅ ADD THIS LINE
    
    const newInventory = inventory.map(item => 
      item.id === id ? { ...item, ...inventoryForm } : item
    );

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setInventory(newInventory);
    
    // Clear editing state right away for better UX
    setEditingInventoryId(null);
    isEditingRef.current = false;
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });

    const { error } = await supabase
      .from('agritrack_data')
      .update({ inventory: newInventory })
      .eq('id', 1);

    if (error) throw error;

    console.log('✅ Item updated successfully');
  } catch (error) {
    console.error('Error updating inventory item:', error);
    alert('Failed to update item. Please try again.');
    // ❌ ROLLBACK ON ERROR
    loadData();
  }
};
const cancelInventoryEdit = () => {
  setEditingInventoryId(null);
  isEditingRef.current = false;
  setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
};

const addMachineryItem = async () => {
  lastLocalUpdateRef.current = Date.now();
  
  try {
    // ✅ FETCH ALL CURRENT DATA FROM DATABASE FIRST
    const { data: currentData, error: fetchError } = await supabase
      .from('agritrack_data')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentMachinery = currentData?.machinery || [];
    const currentInventory = currentData?.inventory || [];
    const currentServiceHistory = currentData?.service_history || [];
    
    const newItem = { ...machineryForm, id: Date.now() };
    const newMachinery = [...currentMachinery, newItem];
    
    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setMachinery(newMachinery);
    setInventory(currentInventory);
    setServiceHistory(currentServiceHistory);
    
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
    setShowMachineryModal(false);
    
    const { error } = await supabase
      .from('agritrack_data')
      .update({ 
        machinery: newMachinery,
        inventory: currentInventory,
        service_history: currentServiceHistory
      })
      .eq('id', 1);
    
    if (error) throw error;
    console.log('✅ Machinery item added successfully');
    
setTimeout(() => {
  console.log('🔓 Unlocking real-time sync');
  isEditingRef.current = false;
}, 3000);
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
    isEditingRef.current = false;
    loadData();
  }
};
  
const deleteMachineryItem = async (id) => {
  // Find the machine we're about to delete
  const machineToDelete = machinery.find(item => item.id === id);
  
  if (!machineToDelete) {
    alert('Machine not found');
    return;
  }

  // Count how many service records will be deleted
  const relatedServiceRecords = serviceHistory.filter(
    record => record.machineName === machineToDelete.name
  );
  const serviceCount = relatedServiceRecords.length;

  // Show detailed confirmation
  const confirmMessage = serviceCount > 0
    ? `Are you sure you want to delete "${machineToDelete.name}"?\n\nThis will also delete ${serviceCount} service record${serviceCount === 1 ? '' : 's'} associated with this machine.`
    : `Are you sure you want to delete "${machineToDelete.name}"?`;

  if (!confirm(confirmMessage)) return;

  try {
    lastLocalUpdateRef.current = Date.now(); // ✅ ADD THIS LINE
    
    // Remove the machine
    const newMachinery = machinery.filter(item => item.id !== id);

    // Remove all service records for this machine
    const newServiceHistory = serviceHistory.filter(
      record => record.machineName !== machineToDelete.name
    );

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setMachinery(newMachinery);
    setServiceHistory(newServiceHistory);

    const { error } = await supabase
      .from('agritrack_data')
      .update({ 
        machinery: newMachinery,
        service_history: newServiceHistory 
      })
      .eq('id', 1);

    if (error) throw error;

    console.log(`✅ Deleted machine "${machineToDelete.name}" and ${serviceCount} service record(s)`);
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
    // ❌ ROLLBACK ON ERROR
    loadData();
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
  try {
    lastLocalUpdateRef.current = Date.now();
    
    const newMachinery = machinery.map(item => 
      item.id === id ? { ...item, ...machineryForm } : item
    );

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setMachinery(newMachinery);
    
    // Clear editing state right away
    setEditingMachineryId(null);  // ✅ Correct
    isEditingRef.current = false;
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });

    const { error } = await supabase
      .from('agritrack_data')
      .update({ machinery: newMachinery })
      .eq('id', 1);

    if (error) throw error;

    console.log('✅ Machinery updated successfully');
  } catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
    // ❌ ROLLBACK ON ERROR
    loadData();
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
  try {
    alert('🔧 Function called! Date: ' + serviceForm.date + ', Machine: ' + serviceForm.machineName);
    
  console.log('🔧 ADD SERVICE RECORD CALLED');
  console.log('📱 Is Mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  console.log('📅 Service Form:', JSON.stringify(serviceForm, null, 2));
  console.log('📅 Machine Name:', serviceForm.machineName);
  console.log('📅 Service Type:', serviceForm.serviceType);
  console.log('📅 Date Value:', serviceForm.date);
  console.log('📅 Date Type:', typeof serviceForm.date);
  
  // Check if required fields are filled
  if (!serviceForm.machineName) {
    alert('⚠️ Please select a machine');
    return;
  }
  
  lastLocalUpdateRef.current = Date.now();
  
  try {
    // ✅ FETCH ALL CURRENT DATA FROM DATABASE FIRST
    const { data: currentData, error: fetchError } = await supabase
      .from('agritrack_data')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentServiceHistory = currentData?.service_history || [];
    const currentInventory = currentData?.inventory || [];
    const currentMachinery = currentData?.machinery || [];
    
console.log('📅 Service Form Data:', serviceForm);
console.log('📅 Date from form:', serviceForm.date);

// Validate date before creating record
const recordDate = serviceForm.date || new Date().toISOString().split('T')[0];
console.log('📅 Final date being saved:', recordDate);
console.log('📅 serviceForm.date value:', serviceForm.date);

// Force the date format
const finalDate = recordDate || new Date().toISOString().split('T')[0];

alert('📅 About to save with date: ' + finalDate);

const newRecord = { 
  ...serviceForm, 
  id: Date.now(),
  date: finalDate,
  photoUrl: serviceForm.photoUrl || ''
};

alert('📝 Full record: ' + JSON.stringify(newRecord));

console.log('📝 Complete record to save:', newRecord);

console.log('📅 New Record to save:', newRecord);
    const newServiceHistory = [...currentServiceHistory, newRecord];
    
 // ✅ Block real-time updates during save
isEditingRef.current = true;
lastLocalUpdateRef.current = Date.now();

// ✅ UPDATE LOCAL STATE IMMEDIATELY
setServiceHistory(newServiceHistory);
setInventory(currentInventory);
setMachinery(currentMachinery);

setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });
setShowServiceModal(false);

console.log('💾 SAVING TO DATABASE...', {
  serviceCount: newServiceHistory.length,
  newRecord: newRecord
});

console.log('💾 About to save - Record count:', newServiceHistory.length);
console.log('💾 New record details:', JSON.stringify(newRecord));

const { error, data } = await supabase
  .from('agritrack_data')
  .update({ 
    service_history: newServiceHistory,
    inventory: currentInventory,
    machinery: currentMachinery,
    updated_at: new Date().toISOString()
  })
  .eq('id', 1)
  .select();

console.log('💾 DATABASE SAVE COMPLETE');
console.log('💾 Error?', error);
console.log('💾 Data returned?', data);

if (error) {
  console.error('❌ DATABASE ERROR:', error);
  throw error;
}
console.log('✅ Service record added successfully - Count:', newServiceHistory.length);
    
    // ✅ Clear editing flag AFTER successful save with delay
setTimeout(() => {
  console.log('🔓 Unlocking real-time sync');
  isEditingRef.current = false;
}, 3000);
} catch (error) {
    console.error('Add error:', error);
    alert('❌ ERROR SAVING: ' + error.message);
    isEditingRef.current = false;
    // ❌ ROLLBACK ON ERROR
    loadData();
  }
  } catch (outerError) {
    alert('❌ OUTER ERROR: ' + outerError.message);
    console.error('Outer error:', outerError);
  }
};
  const deleteServiceRecord = async (id) => {
  if (!confirm('Are you sure you want to delete this service record?')) return;

  try {
    lastLocalUpdateRef.current = Date.now(); // ✅ ADD THIS LINE
    
    const newServiceHistory = serviceHistory.filter(record => record.id !== id);

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setServiceHistory(newServiceHistory);

    const { error } = await supabase
      .from('agritrack_data')
      .update({ service_history: newServiceHistory })
      .eq('id', 1);

    if (error) throw error;
    console.log('✅ Service record deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
    // ❌ ROLLBACK ON ERROR
    loadData();
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
    photoUrl: record.photoUrl || ''
  });
};

const saveServiceEdit = async (id) => {
  try {
    lastLocalUpdateRef.current = Date.now();
    
    const newServiceHistory = serviceHistory.map(record => 
      record.id === id ? { ...record, ...serviceForm } : record
    );

    // ✅ UPDATE LOCAL STATE IMMEDIATELY
    setServiceHistory(newServiceHistory);
    
    // Clear editing state right away
    setEditingServiceId(null);
    isEditingRef.current = false;
    setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });

    const { error } = await supabase
      .from('agritrack_data')
      .update({ service_history: newServiceHistory })
      .eq('id', 1);

    if (error) throw error;

    console.log('✅ Service record updated successfully');
  } catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
    // ❌ ROLLBACK ON ERROR
    loadData();
  }
};

const cancelServiceEdit = () => {
  setEditingServiceId(null);
  isEditingRef.current = false;
  setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });
  setMachineSearchModal('');
};

  const quickUpdateQuantity = async (id, delta) => {
    lastLocalUpdateRef.current = Date.now();
    const newInventory = inventory.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, (parseInt(item.quantity) || 0) + delta).toString() } : item
    );

    setInventory(newInventory);

    try {
      const { error } = await supabase
        .from('agritrack_data')
        .update({ inventory: newInventory })
        .eq('id', 1);

      if (error) throw error;
    } catch (error) {
      console.error('Update error:', error);
      loadData();
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
    background: theme === 'dark' ? '#0a0a0a' : '#f3f4f6',
    backgroundImage: theme === 'dark' 
      ? `radial-gradient(circle at 0% 0%, transparent 40px, rgba(16, 185, 129, 0.12) 40px, rgba(16, 185, 129, 0.12) 45px, transparent 45px),
         radial-gradient(circle at 50% 50%, transparent 30px, rgba(16, 185, 129, 0.15) 30px, rgba(16, 185, 129, 0.15) 35px, transparent 35px),
         radial-gradient(circle at 100% 100%, transparent 40px, rgba(16, 185, 129, 0.12) 40px, rgba(16, 185, 129, 0.12) 45px, transparent 45px)`
      : 'repeating-radial-gradient(circle at 0 0, transparent 0, #f3f4f6 40px), repeating-linear-gradient(rgba(6, 182, 212, 0.03), rgba(16, 185, 129, 0.03))',
    backgroundSize: theme === 'dark' ? '200px 200px' : 'auto',
    backgroundPosition: theme === 'dark' ? '0 0, 100px 100px, 200px 200px' : 'auto'
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
    <div style={{ ...styles.welcomeCard, background: 'rgba(6, 182, 212, 0.4)', border: '1px solid #06b6d4' }}>
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

{/* How to Use Guide */}
    <div style={{ 
      background: 'rgba(6, 182, 212, 0.2)', 
      border: '1px solid rgba(6, 182, 212, 0.5)',
      borderRadius: '12px',
      padding: '32px',
      marginTop: '24px'
    }}>
      <h2 style={{ 
        fontSize: '1.75rem', 
        marginBottom: '24px',
        background: 'linear-gradient(to right, #10b981, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        How to Use the App
      </h2>

      {/* Inventory Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '16px',
          color: '#06b6d4',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Package size={24} /> Inventory Management
        </h3>
        <div style={{ 
          paddingLeft: '36px',
          color: currentTheme.text,
          lineHeight: '1.8'
        }}>
          {userRole === 'employee' ? (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Items:</strong> Browse all inventory items with details like part numbers, quantities, and locations
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Search & Filter:</strong> Use the search bar to quickly find specific items by name, part number, or location
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Quantities:</strong> See current stock levels for all items (read-only)
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Stock Alerts:</strong> Low stock items are marked with a red warning badge, overstocked items show yellow
              </p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Add New Items:</strong> Click "Add Item" to create inventory entries with photos, part numbers, and stock levels
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Edit Items:</strong> Click the blue edit icon to modify item details, locations, or min/max quantities
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Quick Updates:</strong> Use + and - buttons for fast quantity adjustments
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Stock Alerts:</strong> Set min/max quantities to get automatic low stock and overstock warnings
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Delete Items:</strong> Click the red trash icon to remove items (requires confirmation)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Machinery Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '16px',
          color: '#06b6d4',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Truck size={24} /> Machinery Tracking
        </h3>
        <div style={{ 
          paddingLeft: '36px',
          color: currentTheme.text,
          lineHeight: '1.8'
        }}>
          {userRole === 'employee' ? (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Equipment:</strong> Access complete list of all farm machinery and equipment
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Search Records:</strong> Find specific machines by name, VIN/serial number, or category
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Service History:</strong> Click the purple "Services" button on any machine to see its complete maintenance history
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Check Details:</strong> View VIN numbers, categories, and photos for each piece of equipment
              </p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Add Machines:</strong> Click "Add Machine" to register new equipment with photos and VIN/serial numbers
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Categorize:</strong> Organize equipment by type (tractors, combines, sprayers, etc.)
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Service History:</strong> Click the purple "Services" button to jump to that machine's maintenance records
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Edit Records:</strong> Update machine information, categories, or add photos anytime
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Remove Equipment:</strong> Delete machinery records when equipment is sold or retired
              </p>
            </>
          )}
        </div>
      </div>

      {/* Service Records Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '16px',
          color: '#06b6d4',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={24} /> Service History
        </h3>
        <div style={{ 
          paddingLeft: '36px',
          color: currentTheme.text,
          lineHeight: '1.8'
        }}>
          {userRole === 'employee' ? (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• View Records:</strong> See complete service history for all equipment
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Machine Filter:</strong> When viewing from Machinery tab, records are automatically filtered to that specific machine
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Search History:</strong> Find services by machine name, type, technician, or notes
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Sort Records:</strong> Organize by date to track maintenance patterns
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Review Details:</strong> Check service dates, technicians, detailed notes, and attached photos
              </p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Log Services:</strong> Click "Add Service Record" and select a machine from the dropdown menu
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Select Machine:</strong> Choose from your machinery list to ensure accurate tracking
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Add Details:</strong> Include service type, date, technician names, and detailed notes
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Attach Photos:</strong> Upload service photos or receipts for complete documentation
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Edit History:</strong> Update service records if details change or need correction
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Export Data:</strong> Generate reports and export service history via Settings
              </p>
            </>
          )}
        </div>
      </div>

      {/* General Features */}
      <div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          marginBottom: '16px',
          color: '#06b6d4',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Users size={24} /> General Features
        </h3>
        <div style={{ 
          paddingLeft: '36px',
          color: currentTheme.text,
          lineHeight: '1.8'
        }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>• Real-Time Sync:</strong> All changes sync instantly across all devices - no manual refresh needed
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>• Search & Sort:</strong> Every tab has powerful search and sorting options to find what you need
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>• Mobile Friendly:</strong> Works perfectly on phones, tablets, and computers
          </p>
          {userRole !== 'employee' && (
            <>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Import/Export:</strong> Bulk import data from CSV files or export for backups via Settings
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>• Dark/Light Mode:</strong> Switch themes in Settings for comfortable viewing
              </p>
            </>
          )}
        </div>
      </div>
    </div>

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
    isEditingRef.current = true;
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
                    {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
                    {inventoryForm.photoUrl && (
                      <img src={inventoryForm.photoUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '8px', borderRadius: '8px' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => saveInventoryEdit(item.id)} style={styles.saveButton}>
                      <Save size={16} /> Save
                    </button>
                    <button onClick={cancelInventoryEdit} style={styles.cancelButton}>
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {item.photoUrl && (
                    <img 
                      src={item.photoUrl} 
                      alt={item.name} 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        marginRight: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        border: '2px solid transparent',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'auto'
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
    isEditingRef.current = true;
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
                  <img src={machineryForm.photoUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '8px', borderRadius: '8px' }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => saveMachineryEdit(item.id)} style={styles.saveButton}>
                  <Save size={16} /> Save
                </button>
                <button onClick={cancelMachineryEdit} style={styles.cancelButton}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {item.photoUrl && (
                <img 
                  src={item.photoUrl} 
                  alt={item.name} 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    marginRight: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    border: '2px solid transparent',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'auto'
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
    {serviceFilter && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px',
        padding: '8px 12px',
        background: 'rgba(139, 92, 246, 0.2)',
        border: '1px solid #8b5cf6',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#a78bfa'
      }}>
        <AlertCircle size={16} />
        Showing records for: <strong>{serviceFilter}</strong>
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
    )}
  </div>
  {userRole !== 'employee' && (
   <button 
  onClick={() => {
    setShowServiceModal(true);
    isEditingRef.current = true;
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
                            📎 Upload Photo/File
                          </label>
                          <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const photoUrl = await handlePhotoUpload(file, 'service');
            if (photoUrl) {
              setServiceForm({ ...serviceForm, photoUrl });
            }
          }
          // Clear the input so the same file can be selected again
          e.target.value = '';
        }}
        style={{ ...styles.input, padding: '8px' }}
      />
                          {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
                          {serviceForm.photoUrl && (
                            <img src={serviceForm.photoUrl} alt="Preview" style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button onClick={() => saveServiceEdit(record.id)} style={styles.saveButton}>
                            <Save size={16} /> Save
                          </button>
                          <button onClick={cancelServiceEdit} style={styles.cancelButton}>
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
 {record.photoUrl && (
  <img 
    src={record.photoUrl} 
    alt="Service record" 
    style={{ 
      width: '120px', 
      height: '120px', 
      objectFit: 'cover', 
      borderRadius: '8px',
      flexShrink: 0,
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      border: '2px solid transparent',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      pointerEvents: 'auto'
    }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setViewingImage(record.photoUrl);
      setImageModalTitle(`${record.machineName} - ${record.serviceType}`);
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
  isEditingRef.current = false; // ✅ ADD THIS
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
              {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
              {inventoryForm.photoUrl && (
                <img src={inventoryForm.photoUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '8px', borderRadius: '8px' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addInventoryItem} style={styles.primaryButton}>Add Item</button>
              <button onClick={() => setShowInventoryModal(false)} style={styles.secondaryButton}>Cancel</button>
            </div>
          </Modal>
        )}

        {showMachineryModal && (
          <Modal title="Add Machinery" onClose={() => {
  setShowMachineryModal(false);
  isEditingRef.current = false; // ✅ ADD THIS
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
                <img src={machineryForm.photoUrl} alt="Preview" style={{ maxWidth: '100px', marginTop: '8px', borderRadius: '8px' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addMachineryItem} style={styles.primaryButton}>Add Machine</button>
              <button onClick={() => setShowMachineryModal(false)} style={styles.secondaryButton}>Cancel</button>
            </div>
          </Modal>
        )}

{showServiceModal && (
<Modal title="Add Service Record" onClose={() => {
  setShowServiceModal(false);
  setMachineSearchModal('');
  isEditingRef.current = false; // ✅ ADD THIS
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
    const newDate = e.target.value;
    alert('📅 Date selected: ' + newDate);
    setServiceForm({ ...serviceForm, date: newDate });
  }}
  onInput={(e) => {
    const newDate = e.target.value;
    console.log('📅 Date input event:', newDate);
    setServiceForm({ ...serviceForm, date: newDate });
  }}
  onBlur={(e) => {
    console.log('📅 Date field blurred:', e.target.value);
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
        📎 Upload Photo/File (Optional)
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const photoUrl = await handlePhotoUpload(file, 'service');
            if (photoUrl) {
              setServiceForm({ ...serviceForm, photoUrl });
            }
          }
          // Clear the input so the same file can be selected again
          e.target.value = '';
        }}
        style={{ ...styles.input, padding: '8px' }}
      />
      {uploadingPhoto && <p style={{ color: '#10b981', fontSize: '0.875rem' }}>Uploading...</p>}
      {serviceForm.photoUrl && (
        <img src={serviceForm.photoUrl} alt="Preview" style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px' }} />
      )}
    </div>
<div style={{ display: 'flex', gap: '12px' }}>
<button 
  onClick={(e) => {
    alert('🔴 BUTTON CLICKED! Machine: ' + serviceForm.machineName + ', Date: ' + serviceForm.date);
    e.preventDefault();
    e.stopPropagation();
    addServiceRecord();
  }}
onTouchEnd={(e) => {
    alert('📱 TOUCH EVENT! Machine: ' + serviceForm.machineName + ', Date: ' + serviceForm.date);
    e.preventDefault();
    e.stopPropagation();
    addServiceRecord();
  }}
  style={{
    ...styles.primaryButton,
    opacity: !serviceForm.machineName || machinery.length === 0 ? 0.5 : 1,
    cursor: !serviceForm.machineName || machinery.length === 0 ? 'not-allowed' : 'pointer'
  }}
  disabled={!serviceForm.machineName || machinery.length === 0}
>
  Add Record
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
