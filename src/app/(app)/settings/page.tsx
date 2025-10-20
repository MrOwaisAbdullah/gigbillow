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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateUserProfile, getUserProfile } from '@/lib/api/users';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';


const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  logoUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});


export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

     const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: '',
            logoUrl: '',
        },
    });

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                const userProfile = await getUserProfile();
                if (userProfile) {
                    setProfile(userProfile);
                    form.reset({
                        displayName: userProfile.displayName || '',
                        logoUrl: userProfile.logoUrl || '',
                    });
                }
            }
        }
        fetchProfile();
    }, [user, form]);


    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        setIsSubmitting(true);
        try {
            await updateUserProfile({
                displayName: values.displayName,
                logoUrl: values.logoUrl,
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
            setIsSubmitting(false);
        }
    }

    const handleAction = (actionName: string) => {
        toast({
            title: 'Coming Soon!',
            description: `${actionName} functionality is not yet implemented.`,
        });
    };

    if (!user) {
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onProfileSubmit)}>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your public profile and account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://your-company.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormDescription>Must be a direct link to an image file (e.g., PNG, JPG).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                    </div>
                    <Button onClick={() => handleAction('Password change')}>Update Password</Button>
                </CardContent>
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
                            <p className='text-sm text-muted-foreground'>Starter Monthly</p>
                        </div>
                        <p className='font-bold text-lg'>$15/mo</p>
                    </div>
                     <Button onClick={() => handleAction('Billing portal')}>Manage Subscription</Button>
                </CardContent>
             </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={() => handleAction('Account deletion')}>Delete My Account</Button>
                </CardContent>
             </Card>
        </div>
    )
}
