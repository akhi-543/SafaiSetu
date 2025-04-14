import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Calendar, LogOut, MapPin, User, Package } from 'lucide-react';
import { Map } from '../components/Map';

interface ScheduledPickup {
  id: string;
  wasteTypes: string[];
  pickupDate: Timestamp;
  quantity: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  userAddress?: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export const DashboardPage = () => {
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [scheduledPickups, setScheduledPickups] = useState<ScheduledPickup[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const wasteTypes = ['Plastic', 'Paper', 'Metal', 'Glass'];
  const quantities = ['Small Bag', 'Medium Bag', 'Large Bag'];

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        await Promise.all([
          fetchUserAddress(),
          fetchPickups()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [currentUser, navigate]);

  const fetchUserAddress = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().address) {
        setUserAddress(userDoc.data().address);
      }
    } catch (error) {
      console.error('Error fetching user address:', error);
      throw error;
    }
  };

  const fetchPickups = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'scheduled_pickups'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const pickups = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          wasteTypes: data.wasteTypes || [],
          pickupDate: data.pickupDate,
          quantity: data.quantity || '',
          location: data.location,
          userAddress: data.userAddress,
          status: data.status || 'Pending'
        } as ScheduledPickup;
      });
      
      setScheduledPickups(pickups);
    } catch (error) {
      console.error('Error fetching pickups:', error);
      throw error;
    }
  };

  const handleWasteTypeToggle = (type: string) => {
    setSelectedWasteTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleSchedulePickup = async () => {
    if (!currentUser || selectedWasteTypes.length === 0 || !pickupDate || !selectedLocation || !quantity) {
      alert('Please select at least one waste type, date, location, and quantity');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'scheduled_pickups'), {
        userId: currentUser.uid,
        wasteTypes: selectedWasteTypes,
        pickupDate: Timestamp.fromDate(new Date(pickupDate)),
        location: selectedLocation,
        userAddress,
        quantity,
        status: 'Pending',
        createdAt: Timestamp.now()
      });

      await fetchPickups();
      
      // Reset form
      setSelectedWasteTypes([]);
      setPickupDate('');
      setSelectedLocation(null);
      setQuantity('');
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      setError('Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  const handleCancelPickup = async (pickupId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        status: 'Cancelled'
      });
      await fetchPickups();
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      setError('Failed to cancel pickup');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 text-sm underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SafaiSetu Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <User className="w-4 h-4 mr-2" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule a Pickup
          </h2>
          {userAddress && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Your saved pickup address:</p>
              <p className="text-gray-800 mt-1">{userAddress}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Waste Types</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {wasteTypes.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-3 rounded cursor-pointer ${
                      selectedWasteTypes.includes(type)
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWasteTypes.includes(type)}
                      onChange={() => handleWasteTypeToggle(type)}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Select Quantity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quantities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`px-4 py-2 rounded ${
                      quantity === q
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 border rounded"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Select Location
              </label>
              <Map
                onLocationSelect={(lat, lng, address) => 
                  setSelectedLocation({ lat, lng, address })
                }
                initialLocation={selectedLocation || undefined}
              />
              {selectedLocation && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 font-medium">Selected Location:</p>
                  <p className="text-sm text-gray-800 mt-1">{selectedLocation.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleSchedulePickup}
              disabled={selectedWasteTypes.length === 0 || !pickupDate || !selectedLocation || !quantity}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Confirm Schedule
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            My Scheduled Pickups
          </h2>
          {scheduledPickups.length === 0 ? (
            <p className="text-gray-500">No pickups scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {scheduledPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="border p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {(pickup.wasteTypes || []).map((type) => (
                          <span
                            key={type}
                            className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded"
                          >
                            {type}
                          </span>
                        ))}
                        {pickup.quantity && (
                          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                            {pickup.quantity}
                          </span>
                        )}
                        <span className={`text-sm px-2 py-1 rounded ${
                          pickup.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          pickup.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pickup.status}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {pickup.pickupDate?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    {pickup.status === 'Pending' && (
                      <button
                        onClick={() => handleCancelPickup(pickup.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {pickup.userAddress && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                        <p>Pickup Address: {pickup.userAddress}</p>
                      </div>
                    </div>
                  )}
                  {pickup.location && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink-0" />
                        <p>Location: {pickup.location.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};