import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

export interface PendingPickup {
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
  status: 'Pending';
}

export const usePendingPickups = () => {
  const [pickups, setPickups] = useState<PendingPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'scheduled_pickups'),
          where('status', '==', 'Pending')
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
            status: 'Pending' as const
          } as PendingPickup;
        });

        // Sort pickups by date
        const sortedPickups = fetchedPickups.sort((a, b) => 
          a.pickupDate.toMillis() - b.pickupDate.toMillis()
        );
        
        setPickups(sortedPickups);
      } catch (error) {
        console.error('Error fetching pending pickups:', error);
        toast.error('Failed to load pending pickups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickups();
  }, []);

  return {
    pickups,
    isLoading
  };
}; 