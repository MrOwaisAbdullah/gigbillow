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
import { addTokens } from "@/lib/api/tokens";
import { useState } from "react";
import { Loader2, X, AlertTriangle } from "lucide-react";

type InsufficientTokensDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const packs = [
  { name: "Mini Pack", price: "$5", amount: 50 },
  { name: "Standard Pack", price: "$14", amount: 200 },
  { name: "Agency Pack", price: "$29", amount: 500 },
];

export function InsufficientTokensDialog({
  open,
  onOpenChange,
}: InsufficientTokensDialogProps) {
  const { tokens } = useToken();
  const [isBuying, setIsBuying] = useState<number | null>(null);

  const handleBuy = async (amount: number, index: number) => {
    setIsBuying(index);
    // This is a simulation. In a real app, this would redirect to a Stripe checkout.
    await addTokens(amount);
    setIsBuying(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

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
                    <span className="text-sm text-muted-foreground">{pack.price}</span>
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
