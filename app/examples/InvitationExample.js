/**
 * Example: Using the useInvitation Hook
 * 
 * This file demonstrates how to use the useInvitation hook in your components.
 * You can copy these patterns into your actual components.
 */

'use client';
import { useRef } from 'react';
import { toPng } from 'html-to-image';
import useInvitation from '../hooks/useInvitation';
import Button from '../components/Button';
import Toast from '../components/Toast';

export default function InvitationExample() {
    const cardRef = useRef(null);
    const { loading, error, invitation, saveWithImage, clearError } = useInvitation();

    const handleSave = async () => {
        try {
            // Generate image from card
            const dataUrl = await toPng(cardRef.current, { quality: 0.95 });

            // Prepare event data
            const eventData = {
                title: 'My Event',
                eventType: 'Birthday',
                category: 'Birthday',
                // ... other event fields
            };

            // Save invitation with image
            const result = await saveWithImage(eventData, dataUrl);

            console.log('Invitation saved:', result);
            // Handle success (e.g., show toast, redirect, etc.)
        } catch (err) {
            console.error('Failed to save:', err);
            // Error is already set in the hook state
        }
    };

    return (
        <div>
            {/* Show error toast if there's an error */}
            {error && (
                <Toast
                    visible={true}
                    message={error}
                    type="error"
                    onClose={clearError}
                />
            )}

            {/* Your invitation card */}
            <div ref={cardRef}>
                {/* Card content here */}
                <h1>Invitation Preview</h1>
            </div>

            {/* Save button */}
            <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Invitation'}
            </Button>

            {/* Display saved invitation data */}
            {invitation && (
                <div>
                    <h3>Saved Invitation</h3>
                    <p>ID: {invitation.id}</p>
                    <p>Status: {invitation.status}</p>
                    <p>Image URL: {invitation.imageUrl}</p>
                </div>
            )}
        </div>
    );
}

/**
 * Alternative Pattern: Using the service directly
 * 
 * If you prefer not to use the hook, you can import the service functions directly:
 */

/*
import { saveInvitationWithImage } from '../services/invitationService';

const handleSave = async () => {
    try {
        setLoading(true);
        const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
        const result = await saveInvitationWithImage(eventData, dataUrl);
        console.log('Saved:', result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};
*/

/**
 * Pattern: Fetching an existing invitation
 */

/*
import useInvitation from '../hooks/useInvitation';

function ViewInvitation({ invitationId }) {
    const { loading, error, invitation, fetch } = useInvitation();

    useEffect(() => {
        if (invitationId) {
            fetch(invitationId);
        }
    }, [invitationId, fetch]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!invitation) return <div>No invitation found</div>;

    return (
        <div>
            <h2>{invitation.templateId}</h2>
            <img src={invitation.imageUrl} alt="Invitation" />
            <p>Status: {invitation.status}</p>
        </div>
    );
}
*/

/**
 * Pattern: Creating invitation without image
 */

/*
import useInvitation from '../hooks/useInvitation';

function CreateInvitation() {
    const { loading, error, create } = useInvitation();

    const handleCreate = async () => {
        try {
            const result = await create({
                eventId: 'some-uuid',
                templateId: 'birthday-template',
                imageUrl: 'https://example.com/image.png' // Optional
            });
            console.log('Created:', result);
        } catch (err) {
            console.error('Failed:', err);
        }
    };

    return (
        <button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Invitation'}
        </button>
    );
}
*/
