"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
    return (
        <header className="w-full border-b bg-background text-foreground">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-10">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold">
                    MES
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="/auth" className="hover:text-primary transition-colors">
                        LOGIN | REGISTRATION
                    </Link>
                </nav>

                {/* Mobile Menu (Sheet) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="flex flex-col mt-14 space-y-4 text-center">
                            <Link href="/auth" className="hover:text-primary transition-colors">
                                LOGIN | REGISTRATION
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};
