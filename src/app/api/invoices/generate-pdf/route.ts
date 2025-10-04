import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore, storage } from '@/lib/firebase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDFDocument } from '@/components/invoices/invoice-pdf-document';
import type { Invoice, Client, Project } from '@/lib/types';
import type { UserInfo } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import React from 'react';


async function getInvoiceData(invoiceId: string, userId: string) {
    const invoiceRef = adminFirestore.collection('users').doc(userId).collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();
    if (!invoiceSnap.exists) throw new Error('Invoice not found');
    const invoiceData = invoiceSnap.data()!;

    // Convert Firestore Timestamps to JS Dates
    const invoice = {
      id: invoiceSnap.id,
      ...invoiceData,
      issuedDate: invoiceData.issuedDate.toDate(),
      dueDate: invoiceData.dueDate.toDate(),
    } as Invoice;

    const clientRef = adminFirestore.collection('users').doc(userId).collection('clients').doc(invoice.clientId);
    const clientSnap = await clientRef.get();
    if (!clientSnap.exists) throw new Error('Client not found');
    const client = { id: clientSnap.id, ...clientSnap.data() } as Client;

    const projectRef = adminFirestore.collection('users').doc(userId).collection('projects').doc(invoice.projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) throw new Error('Project not found');
    const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

    // We need the user's details for the invoice (name, email)
    const user = await getAuth().getUser(userId);

    return { invoice, client, project, user };
}

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const { invoice, client, project, user } = await getInvoiceData(invoiceId, userId);

    // Cast user to a plain object to satisfy @react-pdf/renderer's requirements
    const userObject: UserInfo = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        photoURL: user.photoURL ?? '',
        phoneNumber: user.phoneNumber ?? '',
        providerId: user.providerData?.[0]?.providerId || '',
        toJSON: () => ({...user})
    };

    const pdfBuffer = await renderToBuffer(
        React.createElement(InvoicePDFDocument, { invoice, client, project, user: userObject })
    );

    const bucket = storage.bucket();
    const filePath = `invoices/${userId}/${invoice.invoiceNumber}.pdf`;
    const file = bucket.file(filePath);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    // Make the file publically accessible - for a real app, you'd want more secure, time-limited URLs.
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({ pdfUrl: publicUrl });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
