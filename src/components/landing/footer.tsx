import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="w-full shrink-0 border-t">
      <div className="container mx-auto flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between gap-4 py-4 px-4 md:px-6">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          &copy; {new Date().getFullYear()} OwFlex. All rights reserved.
        </p>
        <div className="text-xs text-muted-foreground">
          Made with ❤️ by{" "}
          <a
            href="https://owaisabdullah.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Owais Abdullah
          </a>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/terms-of-service"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy-policy"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
