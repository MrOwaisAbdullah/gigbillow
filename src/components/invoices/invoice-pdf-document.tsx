'use client';

import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { Invoice, Client, Project } from '@/lib/types';
import type { UserInfo } from 'firebase-admin/auth';

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

type InvoicePDFDocumentProps = {
  invoice: Invoice;
  client: Client;
  project: Project;
  user: UserInfo;
}

export function InvoicePDFDocument({ invoice, client, project, user }: InvoicePDFDocumentProps) {
  const taxAmount = (invoice.subTotal * invoice.taxRate) / 100;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{user.displayName || 'ProManFlow'}</Text>
            <Text>{user.email}</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.textMuted}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
            <View>
                <Text style={[styles.textMuted, { marginBottom: 4 }]}>Bill To</Text>
                <Text style={styles.billTo}>{client.name}</Text>
                <Text>{client.email}</Text>
            </View>
            <View style={{textAlign: 'right'}}>
                <Text style={[styles.textMuted, { marginBottom: 4 }]}>Issue Date</Text>
                <Text style={{fontWeight: 600, marginBottom: 8}}>{format(new Date(invoice.issuedDate), 'PPP')}</Text>
                <Text style={[styles.textMuted, { marginBottom: 4 }]}>Due Date</Text>
                <Text style={{fontWeight: 600}}>{format(new Date(invoice.dueDate), 'PPP')}</Text>
            </View>
        </View>

        {invoice.enhancedSummary && (
            <View style={styles.summarySection}>
                <Text>{invoice.enhancedSummary}</Text>
            </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '100%' }]}>Description</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCellDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sub-total</Text>
              <Text style={styles.totalAmount}>${invoice.subTotal.toFixed(2)}</Text>
            </View>
             <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
              <Text style={styles.totalAmount}>${taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalAmount}>${invoice.amount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        {invoice.notes && (
            <View style={{marginTop: 30}}>
                <Text style={{fontWeight: 600, marginBottom: 4}}>Notes</Text>
                <Text style={styles.textMuted}>{invoice.notes}</Text>
            </View>
        )}

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  )
};
