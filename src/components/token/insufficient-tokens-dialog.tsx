
'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToken } from "./token-provider";
import { addTokens } from "@/lib/api/tokens";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type InsufficientTokensDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const packs = [
    { name: 'Mini Pack', price: '$5', amount: 50 },
    { name: 'Standard Pack', price: '$15', amount: 200 },
    { name: 'Agency Pack', price: '$30', amount: 500 },
];

export function InsufficientTokensDialog({ open, onOpenChange }: InsufficientTokensDialogProps) {
    const { tokens } = useToken();
    const [isBuying, setIsBuying] = useState<number | null>(null);

    const handleBuy = async (amount: number, index: number) => {
        setIsBuying(index);
        // This is a simulation. In a real app, this would redirect to a Stripe checkout.
        await addTokens(amount);
        setIsBuying(null);
        onOpenChange(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Insufficient Tokens</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have {tokens} tokens remaining. Please purchase a pack to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4 py-4">
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
                                {isBuying === index ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <span className="text-lg font-bold">{pack.amount}</span>
                                        <span className="font-semibold">{pack.name}</span>
                                        <span className="text-sm text-muted-foreground">{pack.price}</span>
                                    </>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
