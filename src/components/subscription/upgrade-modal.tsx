'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featureName?: string;
}

export function UpgradeModal({ open, onOpenChange, featureName = 'This feature' }: UpgradeModalProps) {
    const { toast } = useToast();

    const handleViewPlans = () => {
        onOpenChange(false);
        // In a real app, this would redirect to /billing or /pricing
        toast({
            title: 'Coming Soon!',
            description: 'Billing portal functionality is not yet implemented.',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upgrade to Pro</DialogTitle>
                    <DialogDescription>
                        {featureName} is available for Pro users. Purchase a token pack to unlock this feature and remove watermarks from your documents.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4 rounded-md border p-4">
                        <div className="flex-1">
                            <h4 className="font-semibold">Standard Pack</h4>
                            <p className="text-sm text-muted-foreground">200 Tokens + Pro Features</p>
                        </div>
                        <div className="font-bold">$14</div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleViewPlans}>View All Plans</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
