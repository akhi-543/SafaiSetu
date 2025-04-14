import { useState } from 'react';
import { User, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

export const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { profile, isLoading, isSaving, updateProfile } = useUserProfile(currentUser?.uid);
  const [address, setAddress] = useState('');

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    try {
      await updateProfile({ address });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="w-6 h-6 mr-2 text-green-600" />
              My Profile
            </h1>
            <Link
              to="/dashboard"
              className="text-green-600 hover:text-green-700"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Current Email: {currentUser?.email}</span>
            </div>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pickup Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter your complete pickup address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};