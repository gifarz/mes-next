"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

const formSchemaRegistration = z.object({
    email: z
        .string()
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            { message: "Invalid email address" }
        ),
    name: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }),
    phone: z
        .string()
        .min(10, { message: "Phone must be at least 10 digits." })
        .max(15, { message: "Phone must be at most 15 digits." })
        .regex(/^\d+$/, { message: "Phone must contain only digits." }),
    password: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    }),
    passwordConfirmation: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    }),
    company: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    })
})

const formSchemaLogin = z.object({
    email: z
        .string()
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            { message: "Invalid email address" }
        ),
    password: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    })
})

export default function Auth() {
    const formRegistration = useForm<z.infer<typeof formSchemaRegistration>>({
        resolver: zodResolver(formSchemaRegistration),
        defaultValues: {
            email: "",
            name: "",
            phone: "",
            password: "",
            passwordConfirmation: "",
            company: "",
        },
    })

    const formLogin = useForm<z.infer<typeof formSchemaLogin>>({
        resolver: zodResolver(formSchemaLogin),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    async function onSubmitRegistration(values: z.infer<typeof formSchemaRegistration>) {
        if (values.password === values.passwordConfirmation) {
            const res = await fetch("/api/insertAccount", {
                method: "POST",
                body: JSON.stringify(values),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast.success("Account has been created")
                formRegistration.reset();
            } else {
                toast.error("Error creating account")
            }
        } else {
            toast.error("The password and confirmation password does not match!")
        }
    }

    async function onSubmitLogin(values: z.infer<typeof formSchemaLogin>) {
        console.log('login form', values)
        const res = await fetch("/api/getAccountByEmail", {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            toast.success("Account found")
            formRegistration.reset();
        } else {
            toast.error("Error fetching account")
        }
    }

    return (
        <div className="min-h-screen p-4 overflow-auto px-5 lg:px-20">
            <Toaster position="top-right" />
            <div className="fixed left-1/2 -translate-x-1/2 w-full mt-10 max-w-lg">
                <Tabs defaultValue="login" className="w-full">
                    <TabsList>
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card className="max-h-[400px] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Login to your account</CardTitle>
                                <CardDescription>
                                    Enter your credential below to login to your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...formLogin}>
                                    <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-5">
                                        <FormField
                                            control={formLogin.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type your email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formLogin.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type your password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full">
                                            Login
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="register">
                        <Card className="max-h-[400px] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Register Your Account</CardTitle>
                                <CardDescription>
                                    Please fill all of the field in the form below
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...formRegistration}>
                                    <form onSubmit={formRegistration.handleSubmit(onSubmitRegistration)} className="space-y-5">
                                        <FormField
                                            control={formRegistration.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type your email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type your name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Type your phone"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Type your password"
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="passwordConfirmation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password Confirmation</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Type your confirmation password"
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type your company" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full">
                                            Register
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    );
}
