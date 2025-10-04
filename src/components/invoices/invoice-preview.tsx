'use client';

import { Card, CardContent } from "@/components/ui/card";

type InvoicePreviewProps = {
  htmlContent: string;
};

export function InvoicePreview({ htmlContent }: InvoicePreviewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div id="invoice-preview" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </CardContent>
    </Card>
  );
}
