
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { MessageSquareHeart } from 'lucide-react';

type TimedFeedbackDialogProps = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
};

export function TimedFeedbackDialog({ open, onClose }: TimedFeedbackDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const router = useRouter();

  const handleGiveFeedback = () => {
    onClose(true); // Assume if they click to give feedback, they don't want to see the prompt again.
    router.push('/support/feedback');
  };

  const handleClose = () => {
    onClose(dontShowAgain);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
             <MessageSquareHeart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">How are we doing?</DialogTitle>
          <DialogDescription className="text-center">
            Your feedback during our beta is invaluable. Would you be willing to share your thoughts to help us improve?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
          />
          <Label htmlFor="dont-show-again" className="text-sm font-normal text-muted-foreground">
            Don't show this again
          </Label>
        </div>
        <DialogFooter className="sm:flex-col sm:space-y-2 mt-4">
          <Button type="button" onClick={handleGiveFeedback}>
            Give Feedback
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Remind Me Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
