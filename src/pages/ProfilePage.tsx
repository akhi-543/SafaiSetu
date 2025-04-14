import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUserAddress();
  }, [currentUser]);

  const fetchUserAddress = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().address) {
        setAddress(userDoc.data().address);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        address,
        email: currentUser.email,
        updatedAt: new Date()
      }, { merge: true });

      setMessage({
        type: 'success',
        text: 'Address saved successfully!'
      });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save address. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            </div>
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

            {message.text && (
              <div
                className={`p-3 rounded ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
            >
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};