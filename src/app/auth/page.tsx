"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from 'next/navigation';
import Image from "next/image"
import { useUserStore } from "../../../store/userStore"
import { Roles } from "../../../types/auth/auth"
import { encrypt } from "@/lib/crypto"

const formSchemaRegistration = z.object({
    user_id: z.string().min(3, {
        message: "User ID must be at least 3 characters.",
    }),
    name: z.string().min(3, {
        message: "Name must be at least 3 characters.",
    }),
    role: z
        .string(),
    password: z.string().min(5, {
        message: "Password must be at least 5 characters.",
    }),
    passwordConfirmation: z.string().min(5, {
        message: "Password must be at least 5 characters.",
    })
})

const formSchemaLogin = z.object({
    user_id: z.string().min(3, {
        message: "User ID must be at least 3 characters.",
    }),
    password: z.string().min(5, {
        message: "Password must be at least 5 characters.",
    })
})

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const [isRegistration, setIsRegistration] = useState<boolean>(false)
    const [tabValue, setTabValue] = useState<string>("login")
    const [listRoles, setlistRoles] = useState<Roles[]>([])

    const setUser = useUserStore((state) => state.setUser)

    useEffect(() => {
        const fetcher = async () => {
            const resRole = await fetch("/api/getter/getAllRoles", {
                method: "GET"
            });

            const dataRoles = await resRole.json()
            const fixedRoles = Array.isArray(dataRoles?.data)
                ? dataRoles.data : []

            setlistRoles(fixedRoles)
        }

        fetcher()
    }, [])

    const formRegistration = useForm<z.infer<typeof formSchemaRegistration>>({
        resolver: zodResolver(formSchemaRegistration),
        defaultValues: {
            user_id: "",
            name: "",
            role: "",
            password: "",
            passwordConfirmation: "",
        },
    })

    const formLogin = useForm<z.infer<typeof formSchemaLogin>>({
        resolver: zodResolver(formSchemaLogin),
        defaultValues: {
            user_id: "",
            password: ""
        },
    })

    async function onSubmitRegistration(values: z.infer<typeof formSchemaRegistration>) {
        setIsRegistration(true)
        if (values.password === values.passwordConfirmation) {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(values),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const response = await res.json()

            if (res.ok) {
                toast.success("Account Has Been Created!")
                setTabValue("login")
                formRegistration.reset();
            } else {
                toast.error(response.message)
            }
        } else {
            toast.error("The password and Confirmation Password Does Not Match!")
        }
        setIsRegistration(false)
    }

    async function onSubmitLogin(values: z.infer<typeof formSchemaLogin>) {
        setIsLogin(true)
        const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const json = await res.json()

        if (res.ok) {
            console.log('json', json)
            setUser({
                user_id: json.data.user_id,
                name: json.data.name,
                role: json.data.role,
                factory: json.factory
            })

            const encryptedRole = encrypt(json.data.role)

            localStorage.setItem("role", JSON.stringify(encryptedRole))
            toast.success("Account Found")
            router.push('/app/dashboard');
            formRegistration.reset();
        } else {
            toast.error("Account Not Found")
        }
        setIsLogin(false)
    }

    return (
        <div className="p-4 md:p-0 overflow-auto px-5 md:px-10 lg:px-20">
            <Toaster position="top-right" />
            <div className="fixed left-1/2 -translate-x-1/2 w-full mt-1 max-w-lg">
                <Tabs value={tabValue} onValueChange={setTabValue}>
                    <TabsList className="w-full flex">
                        <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                        <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card className="h-[87vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Login to your account</CardTitle>
                                <CardDescription>
                                    Enter your credential below to login to your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center mt-5 mb-8">
                                    <Image
                                        src="/logo.png"
                                        alt="MES Logo"
                                        width={100}
                                        height={100}
                                    />
                                </div>
                                <Form {...formLogin}>
                                    <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-5">
                                        <FormField
                                            control={formLogin.control}
                                            name="user_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>User ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type Your User ID" {...field} />
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
                                                        <Input
                                                            placeholder="Type Your Password"
                                                            {...field}
                                                            type="password"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full cursor-pointer" disabled={isLogin}>
                                            {isLogin ? (
                                                <>
                                                    <Spinner />
                                                    <span className="ml-0">Submitting</span>
                                                </>
                                            ) : (
                                                "Login"
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="register">
                        <Card className="max-h-[87vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Register Your Account</CardTitle>
                                <CardDescription>
                                    Please fill all of the field in the form below
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center mt-5 mb-8">
                                    <Image
                                        src="/logo.png"
                                        alt="MES Logo"
                                        width={100}
                                        height={100}
                                    />
                                </div>
                                <Form {...formRegistration}>
                                    <form
                                        onSubmit={formRegistration.handleSubmit(onSubmitRegistration)}
                                        className="space-y-3"
                                    >
                                        <FormField
                                            control={formRegistration.control}
                                            name="user_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>User ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Type Your User ID" {...field} />
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
                                                        <Input placeholder="Type Your Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formRegistration.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select Your Role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {listRoles.length === 0 ? (
                                                                    <p className="p-2 text-sm text-gray-500">
                                                                        No role available
                                                                    </p>
                                                                ) : (
                                                                    listRoles.map((role) => (
                                                                        <SelectItem
                                                                            value={role.name}
                                                                            key={role.ai}
                                                                        >
                                                                            {role.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
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
                                                            placeholder="Type Your Password"
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
                                                            placeholder="Type Your Confirmation Password"
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full cursor-pointer"
                                            disabled={isRegistration}
                                        >
                                            {isRegistration ? (
                                                <>
                                                    <Spinner />
                                                    <span className="ml-0">Submitting</span>
                                                </>
                                            ) : (
                                                "Registration"
                                            )}
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
