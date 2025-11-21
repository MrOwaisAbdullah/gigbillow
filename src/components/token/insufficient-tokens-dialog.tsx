"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToken } from "./token-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { buyBundle } from "@/lib/api/stripe-client";
import { useState } from "react";
import { Loader2, X, AlertTriangle, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

type InsufficientTokensDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const packs = [
  { name: "Mini Pack", originalPrice: "$8", price: "$5", amount: 50 },
  { name: "Standard Pack", originalPrice: "$18", price: "$14", amount: 200 },
  { name: "Agency Pack", originalPrice: "$38", price: "$29", amount: 500 },
];

export function InsufficientTokensDialog({
  open,
  onOpenChange,
}: InsufficientTokensDialogProps) {
  const { tokens } = useToken();
  const { user } = useAuth();
  const router = useRouter();
  const [isBuying, setIsBuying] = useState<number | null>(null);

  const handleBuy = async (amount: number, index: number) => {
    setIsBuying(index);
    const packName = packs[index].name;
    let bundleType: 'mini' | 'standard' | 'agency' = 'mini';
    
    if (packName.includes('Standard')) bundleType = 'standard';
    else if (packName.includes('Agency')) bundleType = 'agency';

    await buyBundle(bundleType);
    setIsBuying(null);
    onOpenChange(false);
  };

  const handleLoginRedirect = () => {
    onOpenChange(false);
    router.push('/login');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Show different content for unauthenticated users
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Get Free Tokens
            </DialogTitle>
            <DialogDescription>
              Login to get free 10 tokens every month
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-lg font-semibold mb-2">🎉 Free Monthly Tokens!</p>
              <p className="text-sm text-muted-foreground">
                Create a free account and receive 10 tokens every month to use features like:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left">
                <li>• Generate PDF Invoices</li>
                <li>• Create AI-Powered Proposals</li>
                <li>• Export Detailed Reports</li>
              </ul>
            </div>
            <Button onClick={handleLoginRedirect} size="lg" className="w-full">
              Login to Get Free Tokens
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show purchase options for authenticated users
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Insufficient Tokens
          </DialogTitle>
          <DialogDescription>
            {tokens <= 0
              ? "You have no tokens remaining. Please purchase a pack to continue."
              : tokens <= 5
                ? `You only have ${tokens} token${tokens !== 1 ? 's' : ''} remaining. Please purchase a pack to continue.`
                : `You have ${tokens} tokens remaining. Please purchase a pack to continue.`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 flex-grow overflow-y-auto theme-scrollbar">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">🎉 Limited Time Offer!</p>
          </div>
          <p className="font-semibold">One-time token packs:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {packs.map((pack, index) => (
              <Button
                key={pack.name}
                variant="outline"
                className="flex flex-col h-auto p-4 gap-1 text-center"
                disabled={isBuying !== null}
                onClick={() => handleBuy(pack.amount, index)}
              >
                {isBuying === index ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">{pack.amount}</span>
                    <span className="font-semibold">{pack.name}</span>
                    <div className="flex items-center gap-2 justify-center">
                      <span className="text-sm text-muted-foreground line-through">{pack.originalPrice}</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-500">{pack.price}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">1 token per action</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
