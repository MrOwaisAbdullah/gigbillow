import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore, storage } from '@/lib/firebase-admin';
import type { Invoice, Client, Project } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { format } from 'date-fns';

async function getInvoiceData(invoiceId: string, userId: string) {
    const invoiceRef = adminFirestore.collection('users').doc(userId).collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();
    if (!invoiceSnap.exists) throw new Error('Invoice not found');
    const invoiceData = invoiceSnap.data()!;

    const invoice = {
      id: invoiceSnap.id,
      ...invoiceData,
      issuedDate: invoiceData.issuedDate.toDate().toISOString(),
      dueDate: invoiceData.dueDate.toDate().toISOString(),
    } as Invoice;

    const clientRef = adminFirestore.collection('users').doc(userId).collection('clients').doc(invoice.clientId);
    const clientSnap = await clientRef.get();
    if (!clientSnap.exists) throw new Error('Client not found');
    const client = { id: clientSnap.id, ...clientSnap.data() } as Client;

    const projectRef = adminFirestore.collection('users').doc(userId).collection('projects').doc(invoice.projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) throw new Error('Project not found');
    const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

    const user = await getAuth().getUser(userId);

    return { invoice, client, project, user };
}

function createInvoiceText(invoice: Invoice, client: Client, user: { displayName?: string, email?: string }) {
  const taxAmount = (invoice.subTotal * invoice.taxRate) / 100;
  
  let content = `
==================================================
INVOICE
==================================================

From:
${user.displayName || 'Freelancer'}
${user.email || ''}

Bill To:
${client.name}
${client.email}

--------------------------------------------------

Invoice Number: ${invoice.invoiceNumber}
Issue Date: ${format(new Date(invoice.issuedDate), 'PPP')}
Due Date: ${format(new Date(invoice.dueDate), 'PPP')}

--------------------------------------------------
Line Items:
--------------------------------------------------

`;

  invoice.lineItems.forEach(item => {
    content += `- ${item.description}\n`;
  });

  content += `
--------------------------------------------------

Sub-total: $${invoice.subTotal.toFixed(2)}
Tax (${invoice.taxRate}%): $${taxAmount.toFixed(2)}
Total: $${invoice.amount.toFixed(2)}

--------------------------------------------------
`;

  if (invoice.enhancedSummary) {
    content += `
Summary:
${invoice.enhancedSummary}

`;
  }
  
  if (invoice.notes) {
    content += `
Notes:
${invoice.notes}

`;
  }

  content += `
==================================================
Thank you for your business!
==================================================
  `;

  return content;
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

    const { invoice, client, user } = await getInvoiceData(invoiceId, userId);
    
    const userObject = {
        displayName: user.displayName || 'ProManFlow User',
        email: user.email || '',
    };

    const invoiceContent = createInvoiceText(invoice, client, userObject);
    const textBuffer = Buffer.from(invoiceContent, 'utf-8');

    const bucket = storage.bucket();
    const filePath = `invoices/${userId}/${invoice.invoiceNumber}.txt`;
    const file = bucket.file(filePath);

    await file.save(textBuffer, {
      metadata: {
        contentType: 'text/plain',
      },
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({ pdfUrl: publicUrl });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
