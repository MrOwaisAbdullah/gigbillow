import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore, storage } from '@/lib/firebase-admin';
import type { Invoice, Client, Project } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { format } from 'date-fns';

async function getInvoiceData(invoiceId: string, userId: string): Promise<{ invoice: Invoice; client: Client; project: Project; user: { displayName?: string; email?: string; }; }> {
    const userDocRef = adminFirestore.collection('users').doc(userId);
    
    const invoiceSnap = await userDocRef.collection('invoices').doc(invoiceId).get();
    if (!invoiceSnap.exists) throw new Error('Invoice not found');
    const invoiceData = invoiceSnap.data()!;

    const invoice = {
      id: invoiceSnap.id,
      ...invoiceData,
      issuedDate: invoiceData.issuedDate.toDate(),
      dueDate: invoiceData.dueDate.toDate(),
    } as Invoice;

    const clientSnap = await userDocRef.collection('clients').doc(invoice.clientId).get();
    if (!clientSnap.exists) throw new Error('Client not found');
    const client = { id: clientSnap.id, ...clientSnap.data() } as Client;

    const projectSnap = await userDocRef.collection('projects').doc(invoice.projectId).get();
    if (!projectSnap.exists) throw new Error('Project not found');
    const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

    const userRecord = await getAuth().getUser(userId);
    const user = {
        displayName: userRecord.displayName,
        email: userRecord.email,
    };

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
    
    const invoiceContent = createInvoiceText(invoice, client, user);
    const textBuffer = Buffer.from(invoiceContent, 'utf-8');

    const bucket = storage.bucket();
    const filePath = `invoices/${userId}/${invoice.invoiceNumber}.txt`;
    const file = bucket.file(filePath);

    await file.save(textBuffer, {
      metadata: {
        contentType: 'text/plain',
      },
    });

    const [publicUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    return NextResponse.json({ pdfUrl: publicUrl });
  } catch (error: any) {
    console.error('Invoice Text Generation Error:', error);
    return NextResponse.json({ error: error.message || 'An unknown server error occurred.' }, { status: 500 });
  }
}
