import { cn } from "@/lib/utils"
import Image from 'next/image'
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
    return (
        <Image src='/OwFlex_logo.png' alt='OwFlex Logo' width={50} height={50} className={cn("h-8 w-8 rounded", className)} />
    )
}
