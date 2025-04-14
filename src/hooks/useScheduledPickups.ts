import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

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
  status: 'Pending' | 'Completed' | 'Cancelled';
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

  useEffect(() => {
    const fetchPickups = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'scheduled_pickups'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedPickups = querySnapshot.docs.map(doc => {
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

        // Sort pickups by date and status
        const sortedPickups = fetchedPickups.sort((a, b) => {
          // First, sort by status (Cancelled goes to bottom)
          if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
          if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
          
          // Then sort by date
          return a.pickupDate.toMillis() - b.pickupDate.toMillis();
        });
        
        setPickups(sortedPickups);
      } catch (error) {
        console.error('Error fetching pickups:', error);
        toast.error('Failed to load scheduled pickups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickups();
  }, [userId]);

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

      // Refresh the list
      const q = query(
        collection(db, 'scheduled_pickups'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedPickups = querySnapshot.docs.map(doc => {
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

      // Sort pickups by date and status
      const sortedPickups = fetchedPickups.sort((a, b) => {
        // First, sort by status (Cancelled goes to bottom)
        if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
        if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
        
        // Then sort by date
        return a.pickupDate.toMillis() - b.pickupDate.toMillis();
      });
      
      setPickups(sortedPickups);
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
        status: 'Cancelled' as const
      });

      setPickups(prev => {
        const updatedPickups = prev.map(pickup => 
          pickup.id === pickupId 
            ? { ...pickup, status: 'Cancelled' as const }
            : pickup
        );

        // Sort pickups by date and status
        return updatedPickups.sort((a, b) => {
          // First, sort by status (Cancelled goes to bottom)
          if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
          if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
          
          // Then sort by date
          return a.pickupDate.toMillis() - b.pickupDate.toMillis();
        });
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