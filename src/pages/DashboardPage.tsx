import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useScheduledPickups } from '../hooks/useScheduledPickups';
import { Trash2, Calendar, LogOut, MapPin, User, Package, Loader2 } from 'lucide-react';
import { Map } from '../components/Map';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile(currentUser?.uid);
  const { 
    pickups, 
    isLoading: pickupsLoading, 
    isSaving, 
    isCancelling, 
    addPickup, 
    cancelPickup 
  } = useScheduledPickups(currentUser?.uid);
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);

  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [quantity, setQuantity] = useState('');

  const wasteTypes = ['Plastic', 'Paper', 'Metal', 'Glass'];
  const quantities = ['Small Bag', 'Medium Bag', 'Large Bag'];

  const handleWasteTypeToggle = (type: string) => {
    setSelectedWasteTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const validateForm = () => {
    if (selectedWasteTypes.length === 0) {
      toast.error('Please select at least one waste type');
      return false;
    }
    if (!quantity) {
      toast.error('Please select a quantity');
      return false;
    }
    if (!pickupDate) {
      toast.error('Please select a pickup date');
      return false;
    }
    if (!selectedLocation) {
      toast.error('Please select a pickup location');
      return false;
    }
    return true;
  };

  const handleSchedulePickup = async () => {
    if (!currentUser || !selectedLocation) return;

    if (!validateForm()) {
      return;
    }

    try {
      await addPickup({
        wasteTypes: selectedWasteTypes,
        pickupDate,
        quantity,
        location: selectedLocation,
        userAddress: profile?.address || ''
      });

      // Reset form
      setSelectedWasteTypes([]);
      setPickupDate('');
      setSelectedLocation(null);
      setQuantity('');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (profileLoading || pickupsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          {profile?.address && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Your saved pickup address:</p>
              <p className="text-gray-800 mt-1">{profile.address}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Waste Types</label>
              <div className="grid grid-cols-2 gap-2">
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
                  <p className="text-sm text-gray-800 mt-1">{selectedLocation.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleSchedulePickup}
              disabled={selectedWasteTypes.length === 0 || !pickupDate || !selectedLocation || !quantity || isSaving}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Confirm Schedule'
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            My Scheduled Pickups
          </h2>
          {pickups.length === 0 ? (
            <p className="text-gray-500">No pickups scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {pickups.map((pickup) => (
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
                        onClick={() => cancelPickup(pickup.id)}
                        disabled={isCancelling === pickup.id}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        {isCancelling === pickup.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel'
                        )}
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