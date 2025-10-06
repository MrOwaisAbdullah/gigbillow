import { cn } from "@/lib/utils"
import Image from 'next/image'

export function Logo({ className }: { className?: string }) {
    return (

        <Image src='/GigBillow.png' alt='GigBillow Logo' width={50} height={50} className={cn("h-8 w-8 rounded", className)} />
        // <svg
        //     xmlns="http://www.w3.org/2000/svg"
        //     viewBox="0 0 100 100"
        //     className={cn("h-8 w-8", className)}
        // >
        //     <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        //         <path d="M25,90 L25,31.5 C25,28.46 27.46,26 30.5,26 L55,26" />
        //         <path d="M55,26 L75,10" />
        //         <path d="M75,10 L75,70 C75,73.04 72.54,75.5 69.5,75.5 L25,75.5" />
        //         <path d="M60,25 L40,55 L55,55 L40,85" />
        //     </g>
        //     <text x="53" y="68" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="currentColor">
        //         <tspan dx="-2">O</tspan><tspan dx="-2">W</tspan>
        //     </text>
        // </svg>
    )
}
