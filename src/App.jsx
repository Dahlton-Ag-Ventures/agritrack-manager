// BUILD VERSION: 2025-01-21-v2-FIXED
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Truck, Users, AlertCircle, RefreshCw, Edit2, Save, X, LogOut, ChevronDown } from 'lucide-react';

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
  const [activeSettingsSection, setActiveSettingsSection] = useState('general');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(null);

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
    name: '', partNumber: '', quantity: '', location: '', category: '', 
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

  // Get current theme object
  const currentTheme = themes[theme];

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
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
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
      const { data, error } = await supabase
        .from('agritrack_data')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        console.log('✅ Data loaded');
        setInventory(data.inventory || []);
        setMachinery(data.machinery || []);
        setServiceHistory(data.service_history || []);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('❌ Load error:', error);
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
          if (payload.new) {
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

  // Photo Upload Function (converts to base64 for storage in JSON)
  const handlePhotoUpload = async (file, formType) => {
    if (!file) return null;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Please use an image under 5MB.');
      return null;
    }

    setUploadingPhoto(true);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadingPhoto(false);
        resolve(reader.result); // Returns base64 string
      };
      reader.onerror = () => {
        setUploadingPhoto(false);
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
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
    const newItem = { ...inventoryForm, id: Date.now() };
    const newInventory = [...inventory, newItem];

    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', category: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
    setShowInventoryModal(false);

    try {
      await supabase
        .from('agritrack_data')
        .update({ inventory: newInventory })
        .eq('id', 1);
    } catch (error) {
      console.error('Add error:', error);
      alert('Error: ' + error.message);
    }
  };

  const deleteInventoryItem = async (id) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this item?');
    if (!shouldDelete) return;

    try {
      const newInventory = inventory.filter(item => item.id !== id);
      const { error } = await supabase
        .from('agritrack_data')
        .update({ inventory: newInventory })
        .eq('id', 1);

      if (error) throw error;
      console.log('✅ Item deleted successfully');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const startEditInventory = (item) => {
    setEditingInventoryId(item.id);
    setInventoryForm({
      name: item.name || '',
      partNumber: item.partNumber || '',
      quantity: item.quantity || '',
      location: item.location || '',
      category: item.category || '',
      minQuantity: item.minQuantity || '',
      maxQuantity: item.maxQuantity || '',
      photoUrl: item.photoUrl || ''
    });
  };

  const saveInventoryEdit = async (id) => {
    try {
      const newInventory = inventory.map(item => 
        item.id === id ? { ...item, ...inventoryForm } : item
      );

      const { error } = await supabase
        .from('agritrack_data')
        .update({ inventory: newInventory })
        .eq('id', 1);

      if (error) throw error;

      setEditingInventoryId(null);
      setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', category: '', minQuantity: '', maxQuantity: '', photoUrl: '' });

      console.log('✅ Item updated successfully');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const cancelInventoryEdit = () => {
    setEditingInventoryId(null);
    setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', category: '', minQuantity: '', maxQuantity: '', photoUrl: '' });
  };

  const addMachineryItem = async () => {
    const newItem = { ...machineryForm, id: Date.now() };
    const newMachinery = [...machinery, newItem];

    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
    setShowMachineryModal(false);

    try {
      await supabase
        .from('agritrack_data')
        .update({ machinery: newMachinery })
        .eq('id', 1);
    } catch (error) {
      console.error('Add error:', error);
      alert('Error: ' + error.message);
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

  // Remove the machine
  const newMachinery = machinery.filter(item => item.id !== id);

  // Remove all service records for this machine
  const newServiceHistory = serviceHistory.filter(
    record => record.machineName !== machineToDelete.name
  );

  try {
    // Update both machinery AND service_history in the database
    await supabase
      .from('agritrack_data')
      .update({ 
        machinery: newMachinery,
        service_history: newServiceHistory 
      })
      .eq('id', 1);

    console.log(`✅ Deleted machine "${machineToDelete.name}" and ${serviceCount} service record(s)`);
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};

  const startEditMachinery = (item) => {
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
    const newMachinery = machinery.map(item => 
      item.id === id ? { ...item, ...machineryForm } : item
    );

    setEditingMachineryId(null);
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active' });

    try {
      await supabase
        .from('agritrack_data')
        .update({ machinery: newMachinery })
        .eq('id', 1);
    } catch (error) {
      console.error('Update error:', error);
      alert('Error: ' + error.message);
    }
  };

  const cancelMachineryEdit = () => {
    setEditingMachineryId(null);
    setMachineryForm({ name: '', vinSerial: '', category: '', status: 'Active', photoUrl: '' });
  };
  
const viewMachineServiceHistory = (machineName) => {
  setServiceFilter(machineName);
  setServiceSearch('');
  setActiveTab('service');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  
 const addServiceRecord = async () => {
  const newRecord = { 
    ...serviceForm, 
    id: Date.now(),
    date: serviceForm.date || new Date().toISOString().split('T')[0]
  };
  const newServiceHistory = [...serviceHistory, newRecord];

  setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });
  setShowServiceModal(false);

  try {
    await supabase
      .from('agritrack_data')
      .update({ service_history: newServiceHistory })
      .eq('id', 1);
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  }
};

  const deleteServiceRecord = async (id) => {
    if (!confirm('Are you sure you want to delete this service record?')) return;

    const newServiceHistory = serviceHistory.filter(record => record.id !== id);

    try {
      await supabase
        .from('agritrack_data')
        .update({ service_history: newServiceHistory })
        .eq('id', 1);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error: ' + error.message);
    }
  };

const startEditService = (record) => {
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
  const newServiceHistory = serviceHistory.map(record => 
    record.id === id ? { ...record, ...serviceForm } : record
  );

  setEditingServiceId(null);
  setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });

  try {
    await supabase
      .from('agritrack_data')
      .update({ service_history: newServiceHistory })
      .eq('id', 1);
  } catch (error) {
    console.error('Update error:', error);
    alert('Error: ' + error.message);
  }
};;

const cancelServiceEdit = () => {
  setEditingServiceId(null);
  setServiceForm({ machineName: '', serviceType: '', date: '', notes: '', technician: '', photoUrl: '' });
};

  const quickUpdateQuantity = async (id, delta) => {
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
      background: 'rgba(31, 41, 55, 0.95)',
      border: '1px solid #4b5563',
      borderRadius: '16px',
      padding: '48px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
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
          <h1 style={styles.title}>AgriTrack Manager</h1>

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
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={styles.loginInput}
              required
              autoComplete="current-password"
            />

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
      background: theme === 'dark' ? '#0d1117' : '#f3f4f6',
      backgroundImage: theme === 'dark' 
        ? 'linear-gradient(rgba(37, 99, 235, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.15) 1px, transparent 1px), radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)'
        : 'linear-gradient(rgba(17, 24, 39, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 24, 39, 0.15) 1px, transparent 1px), radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)',
      backgroundSize: '50px 50px, 50px 50px, 100% 100%, 100% 100%'
    }}
  >
    <div style={styles.content}>
      <div style={styles.header}>
        <div>
            <h1 style={styles.title}>AgriTrack Manager</h1>
            <p style={styles.subtitle}>Dahlton Ag Ventures</p>
            <p style={styles.stats}>
              {inventory.length} Inventory • {machinery.length} Machines • {serviceHistory.length} Service Records
              {userRole && (
                <span style={{ 
                  marginLeft: '12px', 
                  padding: '4px 12px', 
                  background: userRole === 'employee' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${userRole === 'employee' ? '#6b7280' : '#10b981'}`,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {userRole}
                </span>
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
            <button onClick={() => setShowDebugModal(true)} style={{
              ...styles.statusBadge,
              background: realtimeStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: realtimeStatus === 'connected' ? '#10b981' : '#ef4444',
              color: realtimeStatus === 'connected' ? '#10b981' : '#ef4444'
            }}>
              <Users size={16} />
              {realtimeStatus === 'connected' ? 'Live Sync Active' : 'Sync Error'}
            </button>
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
          {['home', 'inventory', 'machinery', 'service', ...(userRole !== 'employee' ? ['admin'] : [])].map(tab => (
  <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                background: activeTab === tab ? 'linear-gradient(to right, #10b981, #06b6d4)' : currentTheme.tabInactive
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'inventory' && ` (${inventory.length})`}
              {tab === 'machinery' && ` (${machinery.length})`}
              {tab === 'service' && ` (${serviceHistory.length})`}
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
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>{inventory.length}</p>
      </div>
      <div style={{
        background: 'rgba(6, 182, 212, 0.15)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Total Machinery</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>{machinery.length}</p>
      </div>
      <div style={{
        background: 'rgba(6, 182, 212, 0.15)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>Service Records</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>{serviceHistory.length}</p>
      </div>
    </div>
  </div>
)}
        
        {activeTab === 'inventory' && (
          <div>
            <div style={styles.tabHeader}>
              <h2 style={{ fontSize: '1.5rem' }}>Inventory Items</h2>
              {userRole !== 'employee' && (
                <button onClick={() => setShowInventoryModal(true)} style={styles.addButton}>
                  <Plus size={20} /> Add Item
                </button>
              )}
            </div>

            <div style={styles.searchSortContainer}>
              <input
                type="text"
                placeholder="🔍 Search inventory (name, part number, location)..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={inventorySort}
                onChange={(e) => setInventorySort(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="quantity-asc">Stock (Low → High)</option>
                <option value="quantity-desc">Stock (High → Low)</option>
                <option value="location">Location</option>
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
              <div style={styles.itemsList}>
                {getFilteredAndSortedInventory().map(item => (
                  <div key={item.id} style={styles.itemCard}>
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
                              marginRight: '16px'
                            }} 
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{item.name}</h3>
                            {getStockStatus(item) === 'low' && (
                              <span style={styles.stockBadgeLow}>⚠️ Low Stock</span>
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
            )}
          </div>
        )}

        {activeTab === 'machinery' && (
          <div>
            <div style={styles.tabHeader}>
              <h2 style={{ fontSize: '1.5rem' }}>Machinery</h2>
              {userRole !== 'employee' && (
                <button onClick={() => setShowMachineryModal(true)} style={styles.addButton}>
                  <Plus size={20} /> Add Machine
                </button>
              )}
            </div>

            <div style={styles.searchSortContainer}>
              <input
                type="text"
                placeholder="🔍 Search machinery (name, VIN/serial, category)..."
                value={machinerySearch}
                onChange={(e) => setMachinerySearch(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={machinerySort}
                onChange={(e) => setMachinerySort(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="category">Category</option>
              </select>
            </div>

            {machinery.length === 0 ? (
              <div style={styles.emptyState}>
                <Truck size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p>No machinery yet</p>
              </div>
            ) : getFilteredAndSortedMachinery().length === 0 ? (
              <div style={styles.emptyState}>
                <Truck size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p>No machines match your search</p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {getFilteredAndSortedMachinery().map(item => (
                  <div key={item.id} style={styles.itemCard}>
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
                              marginRight: '16px'
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
    <button onClick={() => setShowServiceModal(true)} style={styles.addButton}>
      <Plus size={20} /> Add Service Record
    </button>
  )}
</div>
            <div style={styles.searchSortContainer}>
              <input
                type="text"
                placeholder="🔍 Search service records (machine, service type, technician, notes)..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={serviceSort}
                onChange={(e) => setServiceSort(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
              </select>
            </div>

            {serviceHistory.length === 0 ? (
              <div style={styles.emptyState}>
                <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p>No service records yet</p>
              </div>
            ) : getFilteredAndSortedService().length === 0 ? (
              <div style={styles.emptyState}>
                <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                <p>No records match your search</p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {getFilteredAndSortedService().map(record => (
                  <div key={record.id} style={styles.itemCard}>
                    {editingServiceId === record.id ? (
                      <div style={{ flex: 1 }}>
                       <div style={{ marginBottom: '16px' }}>
  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
    Select Machine
  </label>
  <select
    style={styles.input}
    value={serviceForm.machineName}
    onChange={(e) => setServiceForm({ ...serviceForm, machineName: e.target.value })}
    required
  >
    <option value="">-- Select a machine --</option>
    {machinery
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(machine => (
        <option key={machine.id} value={machine.name}>
          {machine.name} {machine.category ? `(${machine.category})` : ''}
        </option>
      ))}
  </select>
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
                                  flexShrink: 0
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
          <Modal title="Add Inventory Item" onClose={() => setShowInventoryModal(false)}>
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
          <Modal title="Add Machinery" onClose={() => setShowMachineryModal(false)}>
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
  <Modal title="Add Service Record" onClose={() => setShowServiceModal(false)}>
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.875rem', marginBottom: '4px' }}>
        Select Machine
      </label>
      <select
        style={styles.input}
        value={serviceForm.machineName}
        onChange={(e) => setServiceForm({ ...serviceForm, machineName: e.target.value })}
        required
      >
        <option value="">-- Select a machine --</option>
        {machinery
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          .map(machine => (
            <option key={machine.id} value={machine.name}>
              {machine.name} {machine.category ? `(${machine.category})` : ''}
            </option>
          ))}
      </select>
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
      onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
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
        onClick={addServiceRecord} 
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

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Modal component - defined outside to avoid recreation on each render
function Modal({ children, onClose, title }) {
  // Inline styles for modal since it's outside the main component
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
