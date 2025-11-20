import { toast } from '@/hooks/use-toast';

export async function buyBundle(bundleType: 'mini' | 'standard' | 'agency') {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This is crucial for sending cookies!
      body: JSON.stringify({ bundleType }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error buying bundle:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Could not initiate checkout. Please try again.',
    });
  }
}
