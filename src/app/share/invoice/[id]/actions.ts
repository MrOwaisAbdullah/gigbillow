'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';

export async function getPublicInvoiceById(userId: string, invoiceId: string): Promise<any | null> {
    try {
        const firestore = getFirestoreAdmin();
        const docRef = firestore.collection('users').doc(userId).collection('invoices').doc(invoiceId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (!data) return null;

            // Basic user info - don't expose sensitive data
            const userRef = firestore.collection('users').doc(userId);
            const userSnap = await userRef.get();
            const user = userSnap.exists ? {
                displayName: userSnap.data()?.displayName || 'Freelancer',
                email: userSnap.data()?.email || ''
            } : { displayName: 'Freelancer', email: '' };

            const clientRef = firestore.collection('users').doc(userId).collection('clients').doc(data.clientId);
            const clientSnap = await clientRef.get();
            const client = clientSnap.exists ? clientSnap.data() : null;

            const projectRef = firestore.collection('users').doc(userId).collection('projects').doc(data.projectId);
            const projectSnap = await projectRef.get();
            const project = projectSnap.exists ? projectSnap.data() : null;
            
            return {
                invoice: {
                    id: docSnap.id,
                    ...data,
                    issuedDate: data.issuedDate.toDate().toISOString(),
                    dueDate: data.dueDate.toDate().toISOString(),
                },
                user,
                client,
                project,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching public invoice:", error);
        return null;
    }
}
