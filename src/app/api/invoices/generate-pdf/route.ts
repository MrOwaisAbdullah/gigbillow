
import { NextRequest, NextResponse } from 'next/server';
import { firestore as adminFirestore, storage } from '@/lib/firebase-admin';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, Client, Project } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import React from 'react';
import { format } from 'date-fns';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa_pL7.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#18181b', // zinc-900
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  companyDetails: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: 'hsl(180, 100%, 25%)',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'right',
  },
  invoiceDetails: {
    flexDirection: 'column',
    textAlign: 'right',
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billTo: {
    fontWeight: 600,
    marginBottom: 2,
  },
  textMuted: {
    color: '#71717a', // zinc-500
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5', // zinc-100
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7', // zinc-200
    padding: 8,
  },
  tableHeaderCell: {
    fontWeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7', // zinc-200
    padding: 8,
  },
  tableCellDescription: {
    width: '100%',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    color: '#71717a', // zinc-500
  },
  totalAmount: {
    fontWeight: 600,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7', // zinc-200
  },
  grandTotalLabel: {
    fontWeight: 700,
    fontSize: 12,
  },
  grandTotalAmount: {
    fontWeight: 700,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#a1a1aa', // zinc-400
  },
  summarySection: {
    marginBottom: 30,
    padding: 12,
    backgroundColor: '#f4f4f5',
    borderRadius: 4,
  },
});


async function getInvoiceData(invoiceId: string, userId: string) {
    const invoiceRef = adminFirestore.collection('users').doc(userId).collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();
    if (!invoiceSnap.exists) throw new Error('Invoice not found');
    const invoiceData = invoiceSnap.data()!;

    // Convert Firestore Timestamps to Date objects
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

    const user = await getAuth().getUser(userId);

    return { invoice, client, project, user };
}

function InvoicePDF({ invoice, client, project, user }: { invoice: Invoice; client: Client; project: Project; user: { displayName?: string, email?: string }; }) {
  const taxAmount = (invoice.subTotal * invoice.taxRate) / 100;
  
  return React.createElement(Document, null, 
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.companyDetails },
          React.createElement(Text, { style: styles.companyName }, user.displayName || 'ProManFlow'),
          React.createElement(Text, null, user.email)
        ),
        React.createElement(View, { style: styles.invoiceDetails },
          React.createElement(Text, { style: styles.invoiceTitle }, "INVOICE"),
          React.createElement(Text, { style: styles.textMuted }, invoice.invoiceNumber)
        )
      ),
      React.createElement(View, { style: styles.detailsSection },
        React.createElement(View, null,
          React.createElement(Text, { style: [styles.textMuted, { marginBottom: 4 }] }, "Bill To"),
          React.createElement(Text, { style: styles.billTo }, client.name),
          React.createElement(Text, null, client.email)
        ),
        React.createElement(View, { style: { textAlign: 'right' } },
          React.createElement(Text, { style: [styles.textMuted, { marginBottom: 4 }] }, "Issue Date"),
          React.createElement(Text, { style: { fontWeight: 600, marginBottom: 8 } }, format(new Date(invoice.issuedDate), 'PPP')),
          React.createElement(Text, { style: [styles.textMuted, { marginBottom: 4 }] }, "Due Date"),
          React.createElement(Text, { style: { fontWeight: 600 } }, format(new Date(invoice.dueDate), 'PPP'))
        )
      ),
      invoice.enhancedSummary && React.createElement(View, { style: styles.summarySection },
        React.createElement(Text, null, invoice.enhancedSummary)
      ),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '100%' }] }, "Description")
        ),
        ...invoice.lineItems.map((item, index) => 
          React.createElement(View, { style: styles.tableRow, key: index },
            React.createElement(Text, { style: styles.tableCellDescription }, item.description)
          )
        )
      ),
      React.createElement(View, { style: styles.totalsSection },
        React.createElement(View, { style: styles.totalsContainer },
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Sub-total"),
            React.createElement(Text, { style: styles.totalAmount }, `$${invoice.subTotal.toFixed(2)}`)
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, `Tax (${invoice.taxRate}%)`),
            React.createElement(Text, { style: styles.totalAmount }, `$${taxAmount.toFixed(2)}`)
          ),
          React.createElement(View, { style: styles.grandTotalRow },
            React.createElement(Text, { style: styles.grandTotalLabel }, "Total"),
            React.createElement(Text, { style: styles.grandTotalAmount }, `$${invoice.amount.toFixed(2)}`)
          )
        )
      ),
      invoice.notes && React.createElement(View, { style: { marginTop: 30 } },
        React.createElement(Text, { style: { fontWeight: 600, marginBottom: 4 } }, "Notes"),
        React.createElement(Text, { style: styles.textMuted }, invoice.notes)
      ),
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, null, "Thank you for your business!")
      )
    )
  );
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
    
    // Simplify the user object to avoid serialization issues with the PDF renderer
    const userObject = {
        displayName: user.displayName,
        email: user.email,
    };

    const pdfBuffer = await renderToBuffer(
        React.createElement(InvoicePDF, { invoice, client, project, user: userObject })
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
