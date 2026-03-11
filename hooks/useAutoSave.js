import { useState, useEffect, useCallback, useRef } from 'react';
import { saveCurrentState } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useAutoSave(delay = 1000) {
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);

  const saveState = useCallback(async (stateData) => {
    if (!currentUser) return;

    try {
      setIsSaving(true);
      await saveCurrentState(currentUser.uid, stateData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentUser]);

  const debouncedSave = useCallback((stateData) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveState(stateData);
    }, delay);
  }, [saveState, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, isSaving, lastSaved };
}
