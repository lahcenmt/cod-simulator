import { useEffect, useRef } from 'react';

/**
 * Debounced effect hook to prevent excessive calls
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} dependencies - Dependencies array
 */
export function useDebouncedEffect(callback, delay, dependencies) {
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback();
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, dependencies);
}

/**
 * Safe localStorage wrapper with error handling
 */
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            if (typeof window === 'undefined') return defaultValue;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            if (typeof window === 'undefined') return false;
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    },

    remove: (key) => {
        try {
            if (typeof window === 'undefined') return;
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
        }
    },

    clear: () => {
        try {
            if (typeof window === 'undefined') return;
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};
