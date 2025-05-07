import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, or, onSnapshot, and } from 'firebase/firestore';
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
  pincode?: string;
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
  pincode?: string;
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
          if (!profile.pincode) {
            // If picker has no pincode set, don't show any pending pickups
            q = query(
              collection(db, 'scheduled_pickups'),
              where('assignedTo', '==', userId)
            );
          } else {
            // For pickers with pincode, fetch pending pickups in their area and their assigned pickups
            q = query(
              collection(db, 'scheduled_pickups'),
              or(
                and(
                  where('status', '==', 'Pending'),
                  where('pincode', '==', profile.pincode)
                ),
                where('assignedTo', '==', userId)
              )
            );
          }
        } else {
          // For generators, fetch their own pickups
          q = query(
            collection(db, 'scheduled_pickups'),
            where('userId', '==', userId)
          );
        }
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedPickups = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as ScheduledPickup));

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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, profile?.userType, profile?.pincode]);

  const addPickup = async (pickupData: NewPickupData) => {
    if (!userId) return;

    try {
      setIsSaving(true);
      // Extract pincode from address if not provided
      const pincode = pickupData.pincode || extractPincode(pickupData.location.address);
      
      await addDoc(collection(db, 'scheduled_pickups'), {
        userId,
        ...pickupData,
        pincode,
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

  // Helper function to extract pincode from address
  const extractPincode = (address: string): string | undefined => {
    // Basic regex to find 6-digit number in the address
    const match = address.match(/\b\d{6}\b/);
    return match ? match[0] : undefined;
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