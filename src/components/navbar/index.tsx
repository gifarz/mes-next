"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useI18n } from "../i18n/provider";

type NavbarProps = {
    isAuthPage: boolean;
};

export const Navbar = ({ isAuthPage }: NavbarProps) => {
    const { t, locale, setLocale } = useI18n();

    return (
        <header className="w-full border-b bg-background text-foreground">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-10">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold">
                    MES
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    {
                        isAuthPage ?
                            <Select
                                value={locale}
                                onValueChange={setLocale}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="id">Bahasa</SelectItem>
                                    <SelectItem value="ja">日本語</SelectItem>
                                </SelectContent>
                            </Select>
                            :
                            <div className="flex items-center gap-4">
                                <Link href="/auth" className="hover:text-primary transition-colors">
                                    {t("login").toUpperCase()} | {t("register").toUpperCase()}
                                </Link>
                                <Select
                                    value={locale}
                                    onValueChange={setLocale}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="id">Bahasa</SelectItem>
                                        <SelectItem value="ja">日本語</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                    }
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
                            {
                                isAuthPage ?
                                    <Select
                                        value={locale}
                                        onValueChange={setLocale}
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="id">Bahasa</SelectItem>
                                            <SelectItem value="ja">日本語</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    :
                                    <Link href="/auth" className="hover:text-primary transition-colors">
                                        {t("login").toUpperCase()} | {t("register").toUpperCase()}
                                    </Link>
                            }
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};
