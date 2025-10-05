'use client';

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationControlsProps = {
    onNext: () => void;
    onPrev: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    currentPage: number;
}

export function PaginationControls({ onNext, onPrev, hasNextPage, hasPrevPage, currentPage }: PaginationControlsProps) {
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={!hasPrevPage}
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage}
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
