import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { addDays, subDays } from 'date-fns';

// This is a simplified seeding function. In a real app, you'd want more robust error handling.
export async function seedSampleData(userId: string) {
    const now = new Date();

    // 1. Seed Clients
    const client1Data = { name: 'Acme Inc.', email: 'contact@acme.com', avatarUrl: 'https://picsum.photos/seed/acme/200' };
    const client2Data = { name: 'Stark Industries', email: 'tony@stark.com', avatarUrl: 'https://picsum.photos/seed/stark/200' };
    const client1Ref = await addDoc(collection(db, `users/${userId}/clients`), client1Data);
    const client2Ref = await addDoc(collection(db, `users/${userId}/clients`), client2Data);

    // 2. Seed Projects
    const project1Data = { name: 'Website Redesign', clientId: client1Ref.id, rate: 100, status: 'active' };
    const project2Data = { name: 'Mobile App Dev', clientId: client2Ref.id, rate: 120, status: 'active' };
    const project3Data = { name: 'Branding Guide', clientId: client1Ref.id, rate: 75, status: 'completed' };
    const project1Ref = await addDoc(collection(db, `users/${userId}/projects`), project1Data);
    const project2Ref = await addDoc(collection(db, `users/${userId}/projects`), project2Data);
    const project3Ref = await addDoc(collection(db, `users/${userId}/projects`), project3Data);

    // 3. Seed Time Entries
    const timeEntry1 = { projectId: project1Ref.id, startTime: subDays(now, 2), endTime: subDays(now, 2), hours: 5, description: 'Initial design mockups' };
    const timeEntry2 = { projectId: project1Ref.id, startTime: subDays(now, 1), endTime: subDays(now, 1), hours: 3, description: 'Component development' };
    const timeEntry3 = { projectId: project2Ref.id, startTime: subDays(now, 3), endTime: subDays(now, 3), hours: 8, description: 'API integration' };
    await addDoc(collection(db, `users/${userId}/timeEntries`), timeEntry1);
    await addDoc(collection(db, `users/${userId}/timeEntries`), timeEntry2);
    await addDoc(collection(db, `users/${userId}/timeEntries`), timeEntry3);
    
    // 4. Seed Invoices
    const invoice1Data = {
        invoiceNumber: `INV-${now.getFullYear()}-001`,
        clientId: client1Ref.id,
        projectId: project1Ref.id,
        amount: 800,
        issuedDate: subDays(now, 10),
        dueDate: addDays(subDays(now, 10), 30),
        status: 'unpaid',
        lineItems: [{ description: 'Design and Development work' }],
        subTotal: 800,
        taxRate: 0,
    };
    const invoice2Data = {
        invoiceNumber: `INV-${now.getFullYear()}-002`,
        clientId: client2Ref.id,
        projectId: project2Ref.id,
        amount: 960,
        issuedDate: subDays(now, 40),
        dueDate: subDays(now, 10),
        status: 'overdue',
        lineItems: [{ description: 'API Integration work'}],
        subTotal: 960,
        taxRate: 0,
    };
     const invoice3Data = {
        invoiceNumber: `INV-${now.getFullYear()}-003`,
        clientId: client1Ref.id,
        projectId: project3Ref.id,
        amount: 1500,
        issuedDate: subDays(now, 60),
        dueDate: subDays(now, 30),
        status: 'paid',
        lineItems: [{ description: 'Branding Guide creation'}],
        subTotal: 1500,
        taxRate: 0,
    };
    await addDoc(collection(db, `users/${userId}/invoices`), invoice1Data);
    await addDoc(collection(db, `users/${userId}/invoices`), invoice2Data);
    await addDoc(collection(db, `users/${userId}/invoices`), invoice3Data);
}
