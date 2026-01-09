import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Package, Truck, Users, AlertCircle, RefreshCw } from 'lucide-react';

// Supabase configuration
const supabaseUrl = 'https://ekjjtfemibtaxyhuvgea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVramp0ZmVtaWJ0YXh5aHV2Z2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTM0ODgsImV4cCI6MjA4MzQyOTQ4OH0.c4qjGG0F1nCR0UcyttQKuMX4S_9bJlAPCglzq3fB8v0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [inventory, setInventory] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [lastSync, setLastSync] = useState(null);
  
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMachineryModal, setShowMachineryModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  
  const [inventoryForm, setInventoryForm] = useState({ 
    name: '', partNumber: '', quantity: '', location: '', category: '' 
  });
  const [machineryForm, setMachineryForm] = useState({ 
    name: '', serial: '', category: '', status: 'Active' 
  });

  // Load initial data
  useEffect(() => {
    loadData();
    setupRealtime();
  }, []);

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
  if (payload.new) {
    // Only update if data actually changed
    const newInv = payload.new.inventory || [];
    const newMach = payload.new.machinery || [];
    
    if (JSON.stringify(newInv) !== JSON.stringify(inventory)) {
      setInventory(newInv);
    }
    if (JSON.stringify(newMach) !== JSON.stringify(machinery)) {
      setMachinery(newMach);
    }
    
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
  // Remove auto-save - only save when user makes changes
    const addInventoryItem = async () => {
  const newItem = { ...inventoryForm, id: Date.now() };
  const newInventory = [...inventory, newItem];
  
  setInventoryForm({ name: '', partNumber: '', quantity: '', location: '', category: '' });
  setShowInventoryModal(false);
  
  try {
    await supabase
      .from('agritrack_data')
      .update({ inventory: newInventory })
      .eq('id', 1);
    // Don't update local state - let real-time do it
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  }
};
  // Save after adding
  setTimeout(() => saveData(), 100);
};

  const deleteInventoryItem = async (id) => {
    const newInventory = inventory.filter(item => item.id !== id);
  
  try {
    await supabase
      .from('agritrack_data')
      .update({ inventory: newInventory })
      .eq('id', 1);
    // Don't update local state - let real-time do it
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};

  const addMachineryItem = async () => {
    const newItem = { ...machineryForm, id: Date.now() };
    const newMachinery = [...machinery, newItem];
  
  setMachineryForm({ name: '', serial: '', category: '', status: 'Active' });
  setShowMachineryModal(false);
  
  try {
    await supabase
      .from('agritrack_data')
      .update({ machinery: newMachinery })
      .eq('id', 1);
    // Don't update local state - let real-time do it
  } catch (error) {
    console.error('Add error:', error);
    alert('Error: ' + error.message);
  }
};

  const deleteMachineryItem = async (id) => {
    const newMachinery = machinery.filter(item => item.id !== id);
  
  try {
    await supabase
      .from('agritrack_data')
      .update({ machinery: newMachinery })
      .eq('id', 1);
    // Don't update local state - let real-time do it
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error: ' + error.message);
  }
};

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading AgriTrack...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>AgriTrack Manager</h1>
            <p style={styles.subtitle}>Dahlton Ag Ventures</p>
            <p style={styles.stats}>
              {inventory.length} Inventory • {machinery.length} Machines • {serviceHistory.length} Service Records
            </p>
          </div>
          <div style={styles.statusContainer}>
          {false && syncing && (
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
          </div>
        </div>

        {lastSync && (
          <div style={styles.lastSyncBanner}>
            Last synced: {lastSync.toLocaleTimeString()}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {['home', 'inventory', 'machinery'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                background: activeTab === tab ? 'linear-gradient(to right, #10b981, #06b6d4)' : '#374151'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'inventory' && ` (${inventory.length})`}
              {tab === 'machinery' && ` (${machinery.length})`}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            <div style={styles.welcomeCard}>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome to AgriTrack Manager</h2>
              <p style={{ color: '#d1d5db', marginBottom: '12px' }}>
                Real-time farm management with automatic sync across all devices.
              </p>
              <div style={styles.syncStatus}>
                <Users size={20} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                  {realtimeStatus === 'connected' 
                    ? '✓ Live sync enabled - Changes appear instantly on all devices' 
                    : '⚠️ Connecting to live sync...'}
                </span>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#10b981' }} />
                <h3 style={{ fontSize: '3rem', marginBottom: '8px' }}>{inventory.length}</h3>
                <p>Inventory Items</p>
              </div>
              <div style={{ ...styles.statCard, background: 'rgba(6, 182, 212, 0.2)', borderColor: '#06b6d4' }}>
                <Truck style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#06b6d4' }} />
                <h3 style={{ fontSize: '3rem', marginBottom: '8px' }}>{machinery.length}</h3>
                <p>Machines</p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div style={styles.tabHeader}>
              <h2>Inventory ({inventory.length} items)</h2>
              <button onClick={() => setShowInventoryModal(true)} style={styles.addButton}>
                <Plus size={20} /> Add Item
              </button>
            </div>

            {inventory.length === 0 ? (
              <div style={styles.emptyState}>
                <Package size={64} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
                <h3>No Inventory Items Yet</h3>
                <p>Start by adding your first inventory item</p>
                <button onClick={() => setShowInventoryModal(true)} style={styles.addButton}>
                  Add Your First Item
                </button>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {inventory.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{item.name}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Part #: {item.partNumber}</p>
                      <div style={styles.itemDetails}>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Quantity:</span>
                          <p style={{ fontWeight: '500' }}>{item.quantity}</p>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Location:</span>
                          <p style={{ fontWeight: '500' }}>{item.location}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteInventoryItem(item.id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Machinery Tab */}
        {activeTab === 'machinery' && (
          <div>
            <div style={styles.tabHeader}>
              <h2>Machinery ({machinery.length} machines)</h2>
              <button onClick={() => setShowMachineryModal(true)} style={{ ...styles.addButton, background: '#06b6d4' }}>
                <Plus size={20} /> Add Machine
              </button>
            </div>

            {machinery.length === 0 ? (
              <div style={styles.emptyState}>
                <Truck size={64} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
                <h3>No Machinery Yet</h3>
                <p>Start by adding your first machine</p>
                <button onClick={() => setShowMachineryModal(true)} style={{ ...styles.addButton, background: '#06b6d4' }}>
                  Add Your First Machine
                </button>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {machinery.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{item.name}</h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Serial: {item.serial}</p>
                      <div style={styles.itemDetails}>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Category:</span>
                          <p style={{ fontWeight: '500' }}>{item.category}</p>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Status:</span>
                          <p style={{ 
                            fontWeight: '500',
                            color: item.status === 'Active' ? '#10b981' : '#fbbf24'
                          }}>{item.status}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteMachineryItem(item.id)} style={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showInventoryModal && (
          <Modal onClose={() => setShowInventoryModal(false)} title="Add Inventory Item">
            <input
              type="text"
              placeholder="Part Name"
              value={inventoryForm.name}
              onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Part Number"
              value={inventoryForm.partNumber}
              onChange={(e) => setInventoryForm({ ...inventoryForm, partNumber: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={inventoryForm.quantity}
              onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Location"
              value={inventoryForm.location}
              onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
              style={styles.input}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={addInventoryItem} style={styles.primaryButton}>Add</button>
              <button onClick={() => setShowInventoryModal(false)} style={styles.secondaryButton}>Cancel</button>
            </div>
          </Modal>
        )}

        {showMachineryModal && (
          <Modal onClose={() => setShowMachineryModal(false)} title="Add Machine">
            <input
              type="text"
              placeholder="Machine Name"
              value={machineryForm.name}
              onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Serial Number"
              value={machineryForm.serial}
              onChange={(e) => setMachineryForm({ ...machineryForm, serial: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Category"
              value={machineryForm.category}
              onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
              style={styles.input}
            />
            <select
              value={machineryForm.status}
              onChange={(e) => setMachineryForm({ ...machineryForm, status: e.target.value })}
              style={styles.input}
            >
              <option>Active</option>
              <option>Maintenance</option>
              <option>Inactive</option>
            </select>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={addMachineryItem} style={{ ...styles.primaryButton, background: '#06b6d4' }}>Add</button>
              <button onClick={() => setShowMachineryModal(false)} style={styles.secondaryButton}>Cancel</button>
            </div>
          </Modal>
        )}

        {showDebugModal && (
          <Modal onClose={() => setShowDebugModal(false)} title="🔍 Sync Status">
            <div style={styles.debugInfo}>
              <div>
                <strong>Connection Status:</strong>
                <p>{realtimeStatus === 'connected' ? '✅ Connected' : '❌ Error'}</p>
              </div>
              <div>
                <strong>Last Sync:</strong>
                <p>{lastSync ? lastSync.toLocaleString() : 'Never'}</p>
              </div>
              <div>
                <strong>Data Counts:</strong>
                <p>Inventory: {inventory.length} | Machinery: {machinery.length}</p>
              </div>
            </div>
            <button onClick={() => window.location.reload()} style={styles.primaryButton}>
              🔄 Refresh App
            </button>
          </Modal>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

function Modal({ children, onClose, title }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.5rem' }}>{title}</h3>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #1a202c, #2d3748)',
    color: 'white',
    padding: '24px',
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
  },
  subtitle: {
    color: '#9ca3af',
    marginBottom: '8px',
  },
  stats: {
    color: '#6b7280',
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
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  welcomeCard: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid #10b981',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
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
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid #10b981',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
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
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center',
  },
  itemsList: {
    display: 'grid',
    gap: '16px',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  itemCard: {
    background: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  itemDetails: {
    marginTop: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  deleteButton: {
    padding: '8px',
    background: '#7f1d1d',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
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
    background: '#1f2937',
    border: '1px solid #4b5563',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
  },
  closeButton: {
    background: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    color: 'white',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#111827',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    marginBottom: '16px',
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
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    background: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  debugInfo: {
    background: '#111827',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
};
