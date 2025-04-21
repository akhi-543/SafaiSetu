import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  userType: 'generator' | 'picker';
  isAvailable?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching user profile for:', userId);
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          console.error('No user profile found for:', userId);
          setError(new Error('Profile not found'));
          setProfile(null);
          return;
        }

        const data = userDoc.data();
        // Convert Firestore Timestamps to Dates
        const profile = {
          userId: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;

        console.log('Profile loaded successfully:', profile);
        setProfile(profile);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const updateAvailability = async (isAvailable: boolean) => {
    if (!userId || !profile || profile.userType !== 'picker') {
      return;
    }

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAvailable,
        updatedAt: new Date()
      });
      setProfile(prev => prev ? { ...prev, isAvailable } : null);
      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setIsUpdating(false);
    }
  };

  return { profile, isLoading, error, isUpdating, updateAvailability };
}; 