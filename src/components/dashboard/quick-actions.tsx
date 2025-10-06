
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Timer, FilePlus, Receipt } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
    const actions = [
        {
            title: 'Start Timer',
            description: 'Jump right into your work',
            icon: Timer,
            href: '/track',
        },
        {
            title: 'New Invoice',
            description: 'Bill a client for your work',
            icon: FilePlus,
            href: '/invoices/new',
        },
        {
            title: 'Log Expense',
            description: 'Record a new expense',
            icon: Receipt,
            href: '/expenses',
        },
    ];

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-1">
            {actions.map((action) => (
                 <Card 
                    key={action.title}
                    className="transition-shadow text-white bg-gradient-to-br from-primary to-primary/80 hover:shadow-lg hover:from-primary/90 hover:to-primary/70"
                >
                    <Link 
                        href={action.href}
                        className="block h-full p-4"
                    >
                        <div className="flex items-center gap-4 mb-2">
                             <action.icon className="h-6 w-6 text-white" />
                             <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-primary-foreground/80">
                            {action.description}
                        </CardDescription>
                    </Link>
                </Card>
            ))}
        </div>
    );
}
