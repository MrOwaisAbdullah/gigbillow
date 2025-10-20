
'use client';

import { useState } from "react";
import { InvoicesList } from "@/components/invoices/invoices-list";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search invoices..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          <InvoiceActions />
        </div>
      </div>
      <InvoicesList searchTerm={searchTerm} />
    </div>
  );
}
