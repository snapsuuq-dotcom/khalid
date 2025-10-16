import { Link } from "wouter";
import { Package } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover-elevate px-2 py-1 rounded-md transition-colors" data-testid="link-home">
          <Package className="h-6 w-6 text-primary" />
          <span>Shipment Tracker</span>
        </Link>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
