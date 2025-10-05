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
            description: 'Coming soon',
            icon: Receipt,
            href: '#',
            disabled: true,
        },
    ];

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {actions.map((action) => (
                 <Card 
                    key={action.title}
                    className={cn(
                        "transition-shadow",
                        !action.disabled && "text-white bg-gradient-to-br from-primary to-primary/80 hover:shadow-lg hover:from-primary/90 hover:to-primary/70",
                        action.disabled && "bg-muted/50"
                    )}
                >
                    <Link 
                        href={action.disabled ? '#' : action.href}
                        className={cn(
                            "block h-full p-4", 
                            action.disabled && "pointer-events-none"
                        )}
                    >
                        <div className="flex items-center gap-4 mb-2">
                             <action.icon className={cn("h-6 w-6", action.disabled ? "text-muted-foreground" : "text-white" )} />
                             <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                        <CardDescription className={cn('text-sm', action.disabled ? 'text-muted-foreground' : 'text-primary-foreground/80')}>
                            {action.description}
                        </CardDescription>
                    </Link>
                </Card>
            ))}
        </div>
    );
}
