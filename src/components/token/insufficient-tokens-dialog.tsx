'use client';

import {
  AlertDialog,
  AlertDialogAction,
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
    { name: '50 Tokens', price: '$5', amount: 50 },
    { name: '200 Tokens', price: '$15', amount: 200 },
    { name: '500 Tokens', price: '$30', amount: 500 },
];

export function InsufficientTokensDialog({ open, onOpenChange }: InsufficientTokensDialogProps) {
    const { tokens } = useToken();
    const [isBuying, setIsBuying] = useState<number | null>(null);

    const handleBuy = async (amount: number, index: number) => {
        setIsBuying(index);
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
                    <p className="font-semibold">One-time packs:</p>
                    <div className="grid grid-cols-3 gap-4">
                        {packs.map((pack, index) => (
                            <Button
                                key={pack.name}
                                variant="outline"
                                className="flex flex-col h-auto p-4 gap-1"
                                disabled={isBuying !== null}
                                onClick={() => handleBuy(pack.amount, index)}
                            >
                                {isBuying === index ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <span className="text-lg font-bold">{pack.name}</span>
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
