'use client';

import { Button } from '@/components/ui/button';
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
            disabled: false,
        },
        {
            title: 'Create Invoice',
            description: 'Bill a client for your work',
            icon: FilePlus,
            href: '/invoices/new',
            disabled: false,
        },
        {
            title: 'Track Expense',
            description: 'Coming in Phase-2',
            icon: Receipt,
            href: '#',
            disabled: true,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {actions.map((action) => (
                <Card 
                    key={action.title}
                    className={cn(
                        "hover:shadow-lg transition-shadow",
                        action.disabled && "bg-muted/50"
                    )}
                >
                    <Link href={action.disabled ? '#' : action.href} passHref>
                        <a className={cn("block h-full", action.disabled && "pointer-events-none")}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <action.icon className="h-8 w-8 text-primary" />
                                    <CardTitle className="text-xl">{action.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{action.description}</CardDescription>
                            </CardContent>
                        </a>
                    </Link>
                </Card>
            ))}
        </div>
    );
}
