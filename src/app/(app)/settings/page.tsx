'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateUserProfile, getUserProfile } from '@/lib/api/users';
import { updateUserPassword, deleteUserAccount } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  logoUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});


async function urlToDataUri(url: string): Promise<string> {
    if (!url) return '';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image with status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Failed to convert URL to Data URI:", error);
        throw new Error("Could not fetch image from the provided URL. This may be due to browser security restrictions (CORS). Please try a different URL from a public image host or convert the image to a Data URI manually.");
    }
}


export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

     const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: '',
            logoUrl: '',
        },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                const userProfile = await getUserProfile(user.id);
                if (userProfile) {
                    setProfile(userProfile);
                    profileForm.reset({
                        displayName: userProfile.displayName || '',
                        logoUrl: userProfile.logoUrl || '',
                    });
                }
            }
        }
        fetchProfile();
    }, [user, profileForm]);


    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        setIsProfileSubmitting(true);
        try {
            const currentProfile = await getUserProfile(user.id);
            if (values.logoUrl && !currentProfile?.is_subscribed) {
                toast({
                    variant: 'destructive',
                    title: 'Subscription Required',
                    description: 'Adding a logo is a premium feature. Please purchase a token pack to enable it.',
                });
                setIsProfileSubmitting(false);
                return;
            }

            let logoDataUrl = '';
            if (values.logoUrl) {
                 if (values.logoUrl.startsWith('data:image')) {
                    logoDataUrl = values.logoUrl;
                } else {
                    try {
                        logoDataUrl = await urlToDataUri(values.logoUrl);
                    } catch(e: any) {
                        toast({
                            variant: 'destructive',
                            title: 'Logo Conversion Failed',
                            description: e.message || 'Could not process the logo from the provided URL.',
                            duration: 9000,
                        });
                        setIsProfileSubmitting(false);
                        return;
                    }
                }
            }

            await updateUserProfile(user.id, {
                displayName: values.displayName,
                logoUrl: values.logoUrl,
                logoDataUrl: logoDataUrl,
            });
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your profile. Please try again.',
            });
        } finally {
            setIsProfileSubmitting(false);
        }
    }

    async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
        setIsPasswordSubmitting(true);
        try {
            await updateUserPassword(values.newPassword);
            toast({
                title: 'Password Updated',
                description: 'Your password has been successfully changed.',
            });
            passwordForm.reset();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'Could not update your password. Please try again.',
            });
        } finally {
            setIsPasswordSubmitting(false);
        }
    }

    async function handleDeleteAccount() {
        setIsDeleting(true);
        try {
            await deleteUserAccount();
            toast({
                title: 'Account Deleted',
                description: 'Your account and all associated data have been permanently deleted.',
            });
            // The AuthProvider will redirect to the login page automatically on user deletion.
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'Could not delete your account. Please try again.',
            });
             setIsDeleting(false);
        }
    }


    const handleComingSoon = (actionName: string) => {
        toast({
            title: 'Coming Soon!',
            description: `${actionName} functionality is not yet implemented.`,
        });
    };

    if (!user || !profile) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 pb-8">
             <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

             <Card>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your public profile and account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={profileForm.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue={user.email || ''} readOnly disabled />
                            </div>
                        </CardContent>
                        <CardHeader>
                            <CardTitle>Branding</CardTitle>
                            <CardDescription>Add your company logo to be displayed on invoices and proposals. This requires a purchased token pack.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={profileForm.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://your-company.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                           Paste a public URL to your logo. We will attempt to convert it for embedding. If this fails due to CORS, please use a URL from a provider that allows cross-origin requests.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isProfileSubmitting}>
                                {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Profile
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>

             <Card>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Change your account password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                             <Button type="submit" disabled={isPasswordSubmitting}>
                                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your subscription and billing details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='flex items-center justify-between p-4 rounded-lg bg-muted/50'>
                        <div>
                            <p className='font-semibold'>Current Plan</p>
                            <p className='text-sm text-muted-foreground'>{profile.is_subscribed ? 'Pro Plan' : 'Free Plan'}</p>
                        </div>
                        <p className='font-bold text-lg'>{profile.is_subscribed ? '$14/mo' : '$0/mo'}</p>
                    </div>
                     <Button onClick={() => handleComingSoon('Billing portal')}>Manage Subscription</Button>
                </CardContent>
             </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>This action is irreversible. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete My Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account, your profile, and all of your content including clients, projects, invoices, and time entries.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
             </Card>
        </div>
    )
}
