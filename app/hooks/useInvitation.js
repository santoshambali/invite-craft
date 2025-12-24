/**
 * useInvitation Hook
 *
 * Custom React hook for managing invitation operations
 * Provides state management and error handling for invitation-related actions
 */

import { useState, useCallback } from "react";
import {
  createInvitation,
  updateInvitation,
  getInvitation,
  saveInvitationWithImage,
  updateInvitationWithImage,
  uploadInvitationImage,
} from "../services/invitationService";

export const useInvitation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);

  /**
   * Create a new invitation
   */
  const create = useCallback(async (invitationData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInvitation(invitationData);
      setInvitation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing invitation
   */
  const update = useCallback(async (id, invitationData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateInvitation(id, invitationData);
      setInvitation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch an invitation by ID
   */
  const fetch = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvitation(id);
      setInvitation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save invitation with image upload
   */
  const saveWithImage = useCallback(async (eventData, imageDataUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveInvitationWithImage(eventData, imageDataUrl);
      setInvitation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update invitation with image upload
   */
  const updateWithImage = useCallback(async (id, eventData, imageDataUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateInvitationWithImage(
        id,
        eventData,
        imageDataUrl
      );
      setInvitation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload invitation image only
   */
  const uploadImage = useCallback(async (dataUrl, eventTitle) => {
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await uploadInvitationImage(dataUrl, eventTitle);
      return imageUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setInvitation(null);
  }, []);

  return {
    loading,
    error,
    invitation,
    create,
    update,
    fetch,
    saveWithImage,
    updateWithImage,
    uploadImage,
    clearError,
    reset,
  };
};

export default useInvitation;
