import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PickerDashboardPage } from './pages/PickerDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './contexts/AuthContext';
import { useUserProfile } from './hooks/useUserProfile';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { auth } from './config/firebase';

const RoleBasedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { profile, isLoading, error } = useUserProfile(currentUser?.uid);
  const navigate = useNavigate();

  const handleReturnToLogin = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-600 mb-2">Profile not found. Please try logging in again.</p>
          <p className="text-gray-600 mb-4">If you just created your account, this might take a few seconds.</p>
          <button
            onClick={handleReturnToLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-600 mb-2">Unable to load your profile.</p>
          <p className="text-gray-600 mb-4">Please try logging in again or contact support if the issue persists.</p>
          <button
            onClick={handleReturnToLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile.userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-600 mb-2">User type not set.</p>
          <p className="text-gray-600 mb-4">Please contact support to resolve this issue.</p>
          <button
            onClick={handleReturnToLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return profile.userType === 'generator' ? (
    <DashboardPage />
  ) : (
    <PickerDashboardPage />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;