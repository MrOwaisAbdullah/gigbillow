'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from './upgrade-modal';
import { cn } from '@/lib/utils';

interface PremiumLockProps {
    isSubscribed: boolean;
    featureName?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function PremiumLock({ 
    isSubscribed, 
    featureName = 'Premium Feature', 
    description = 'Upgrade to a paid plan to unlock this feature.',
    children,
    className 
}: PremiumLockProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className={cn("relative", className)}>
            {!isSubscribed && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border border-dashed border-muted-foreground/25">
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg">{featureName}</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            {description}
                        </p>
                        <Button type="button" onClick={() => setShowModal(true)} variant="default" size="sm">
                            Unlock Feature
                        </Button>
                    </div>
                </div>
            )}
            
            <div className={!isSubscribed ? 'opacity-50 pointer-events-none select-none filter blur-[1px]' : ''}>
                {children}
            </div>

            <UpgradeModal 
                open={showModal} 
                onOpenChange={setShowModal} 
                featureName={featureName}
            />
        </div>
    );
}
