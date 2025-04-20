import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, or, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { useUserProfile } from './useUserProfile';

export interface ScheduledPickup {
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
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  assignedTo?: string;
  userId?: string;
  generatorRating?: number;
  pickerRating?: number;
  generatorComment?: string;
  pickerComment?: string;
  completedAt?: Timestamp;
}

interface NewPickupData {
  wasteTypes: string[];
  pickupDate: string;
  quantity: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  userAddress: string;
}

export const useScheduledPickups = (userId: string | undefined) => {
  const [pickups, setPickups] = useState<ScheduledPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const { profile } = useUserProfile(userId);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: () => void;

    const setupListener = async () => {
      try {
        setIsLoading(true);
        let q;
        
        if (profile?.userType === 'picker') {
          // For pickers, fetch both pending pickups and their assigned pickups
          q = query(
            collection(db, 'scheduled_pickups'),
            or(
              where('status', '==', 'Pending'),
              where('assignedTo', '==', userId)
            )
          );
        } else {
          // For generators, fetch their own pickups
          q = query(
            collection(db, 'scheduled_pickups'),
            where('userId', '==', userId)
          );
        }
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedPickups = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              wasteTypes: data.wasteTypes || [],
              pickupDate: data.pickupDate,
              quantity: data.quantity || '',
              location: data.location,
              userAddress: data.userAddress,
              status: data.status || 'Pending',
              assignedTo: data.assignedTo,
              userId: data.userId
            } as ScheduledPickup;
          });

          // Sort pickups by date
          const sortedPickups = fetchedPickups.sort((a, b) => 
            a.pickupDate.toMillis() - b.pickupDate.toMillis()
          );
          
          setPickups(sortedPickups);
          setIsLoading(false);
        }, (error) => {
          console.error('Error in pickup listener:', error);
          toast.error('Failed to load scheduled pickups');
          setIsLoading(false);
        });

      } catch (error) {
        console.error('Error setting up pickup listener:', error);
        toast.error('Failed to load scheduled pickups');
        setIsLoading(false);
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, profile?.userType]);

  const addPickup = async (pickupData: NewPickupData) => {
    if (!userId) return;

    try {
      setIsSaving(true);
      await addDoc(collection(db, 'scheduled_pickups'), {
        userId,
        ...pickupData,
        pickupDate: Timestamp.fromDate(new Date(pickupData.pickupDate)),
        status: 'Pending' as const,
        createdAt: Timestamp.now()
      });

      toast.success('Pickup scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error('Failed to schedule pickup');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const cancelPickup = async (pickupId: string) => {
    try {
      setIsCancelling(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        status: 'Cancelled' as const,
        updatedAt: Timestamp.now()
      });

      toast.success('Pickup cancelled successfully');
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      toast.error('Failed to cancel pickup');
      throw error;
    } finally {
      setIsCancelling(null);
    }
  };

  return {
    pickups,
    isLoading,
    isSaving,
    isCancelling,
    addPickup,
    cancelPickup
  };
}; 