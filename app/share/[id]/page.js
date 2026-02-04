export const dynamic = "force-dynamic";
import ShareContent from "./ShareContent";
import { INVITATION_API_BASE_URL } from "../../config/api";

// Helper to get API URL on server side
// Since execution is on server (node), we can use the localhost URL directly if needed, 
// or the environment variable. 
// For this local setup, http://localhost:8080 is fine.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function generateMetadata({ params }) {
    // Await params if it's a promise (Next.js 15+ change, safe to await in 13/14 too)
    const resolvedParams = await params;
    const id = resolvedParams.id;

    try {
        // Fetch public share data from backend
        // We use the new /share endpoint which returns ShareUrlResponse
        const response = await fetch(`${API_BASE_URL}/api/v1/invitations/${id}/share`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return {
                title: 'Card Not Found',
                description: 'The card you are looking for does not exist or has been removed.'
            };
        }

        const result = await response.json();
        const invitation = result.data; // ShareUrlResponse wrapper

        // Handle image URL
        // If it's a GS path or internal path, we might need a fallback.
        // But if the backend provides a publicly accessible URL (like a signed URL or public bucket), it works.
        const imageUrl = invitation.imageUrl || '/images/default-invite-card.png';

        return {
            title: `${invitation.title}`,
            description: `${invitation.title}.`,
            openGraph: {
                title: invitation.title,
                description: `${invitation.title}.`,
                url: invitation.shareUrl,
                siteName: 'Lagu Cards',
                images: [
                    {
                        url: imageUrl,
                        width: 1200, // Standard OG size
                        height: 630,
                        alt: invitation.title,
                    },
                ],
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: invitation.title,
                description: `${invitation.title}.`,
                images: [imageUrl],
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: 'Card',
            description: '',
        };
    }
}

export default function Page() {
    return <ShareContent />;
}
