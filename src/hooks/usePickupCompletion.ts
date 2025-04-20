import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { ScheduledPickup } from './useScheduledPickups';

export const usePickupCompletion = () => {
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [isRating, setIsRating] = useState<string | null>(null);

  const completePickup = async (pickupId: string) => {
    try {
      setIsCompleting(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        status: 'Completed',
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Pickup marked as completed!');
    } catch (error) {
      console.error('Error completing pickup:', error);
      toast.error('Failed to complete pickup');
      throw error;
    } finally {
      setIsCompleting(null);
    }
  };

  const submitGeneratorRating = async (
    pickupId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      setIsRating(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        generatorRating: rating,
        generatorComment: comment || null,
        updatedAt: Timestamp.now()
      });
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      throw error;
    } finally {
      setIsRating(null);
    }
  };

  const submitPickerRating = async (
    pickupId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      setIsRating(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        pickerRating: rating,
        pickerComment: comment || null,
        updatedAt: Timestamp.now()
      });
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      throw error;
    } finally {
      setIsRating(null);
    }
  };

  return {
    isCompleting,
    isRating,
    completePickup,
    submitGeneratorRating,
    submitPickerRating
  };
}; 