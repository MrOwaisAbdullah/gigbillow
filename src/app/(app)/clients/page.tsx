
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ClientsTable } from "@/components/clients/clients-table"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { Input } from '@/components/ui/input';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
         <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search clients..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button asChild>
              <Link href="/clients/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Client
              </Link>
            </Button>
        </div>
      </div>
      <ClientsTable searchTerm={searchTerm} />
    </div>
  )
}
