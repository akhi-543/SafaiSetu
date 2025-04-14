import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

interface UserProfile {
  address: string;
  email: string;
  updatedAt: Date;
}

export const useUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            address: data.address || '',
            email: data.email || '',
            updatedAt: data.updatedAt?.toDate() || new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      setIsSaving(true);
      await setDoc(doc(db, 'users', userId), {
        ...newProfile,
        updatedAt: new Date()
      }, { merge: true });

      setProfile(prev => prev ? { ...prev, ...newProfile } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    updateProfile
  };
}; 