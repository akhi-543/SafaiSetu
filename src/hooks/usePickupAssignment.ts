import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const usePickupAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);

  const assignPickup = async (pickupId: string, pickerId: string) => {
    setIsAssigning(true);
    try {
      const pickupRef = doc(db, 'scheduled_pickups', pickupId);
      await updateDoc(pickupRef, {
        status: 'Assigned',
        assignedTo: pickerId,
        assignedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Pickup assigned successfully!');
    } catch (error) {
      console.error('Error assigning pickup:', error);
      toast.error('Failed to assign pickup. Please try again.');
      throw error;
    } finally {
      setIsAssigning(false);
    }
  };

  return { isAssigning, assignPickup };
}; 