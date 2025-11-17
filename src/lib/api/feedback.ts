import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import type { Feedback } from '@/lib/types';

export async function submitFeedback(user: User | null, userEmail: string, feedbackText: string) {
  // User can submit feedback either when logged in or not
  const userId = user?.id || null;

  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      user_email: userEmail,
      feedback_text: feedbackText
    });

  if (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

export async function createFeedback(feedback: Omit<Feedback, 'id'>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // This function can be called without authentication for anonymous feedback
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: feedback.userId,
        user_email: feedback.userEmail,
        feedback_text: feedback.feedbackText
      });

    if (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        user_email: feedback.userEmail,
        feedback_text: feedback.feedbackText
      });

    if (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  }
}