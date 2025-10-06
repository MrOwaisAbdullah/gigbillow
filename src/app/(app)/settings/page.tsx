
'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

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
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your public profile and account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" defaultValue={user.displayName || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user.email || ''} readOnly disabled />
                    </div>
                </CardContent>
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
