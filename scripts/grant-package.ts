// To run this script, use the command: npx tsx scripts/grant-package.ts

import { supabase } from '../src/lib/supabase';
import type { UserProfile, UserToken } from '../src/lib/types';

// --- CONFIGURATION ---
const USER_ID_TO_GRANT = 'R7Hkky6alfgBwiofMmCVHo8HtLI3';
const TOKENS_TO_ADD = 200; // Standard Pack
const NEW_ROLLOVER_LIMIT = 150;
// -------------------

async function grantPackage() {
    if (!USER_ID_TO_GRANT) {
        console.error('Error: Please specify the user ID in the USER_ID_TO_GRANT variable.');
        return;
    }

    console.log(`Attempting to grant package to user: ${USER_ID_TO_GRANT}`);

    try {
        // --- 1. Update User Profile ---
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', USER_ID_TO_GRANT)
            .single();

        if (userError || !userData) {
            console.error(`Error: User profile not found for ID: ${USER_ID_TO_GRANT}. Cannot grant package.`, userError);
            return;
        }

        console.log('Updating user profile to set is_subscribed = true...');
        const { error: updateUserError } = await supabase
            .from('users')
            .update({ is_subscribed: true })
            .eq('id', USER_ID_TO_GRANT);

        if (updateUserError) {
            console.error('Error updating user profile:', updateUserError);
            return;
        }
        console.log('User profile updated successfully.');

        // --- 2. Update Token Document ---
        const { data: tokenData, error: tokenError } = await supabase
            .from('user_tokens')
            .select('*')
            .eq('user_id', USER_ID_TO_GRANT)
            .single();

        if (tokenData) {
            console.log(`User has existing token document. Adding ${TOKENS_TO_ADD} tokens...`);
            const { error: updateTokenError } = await supabase
                .from('user_tokens')
                .update({
                    balance: tokenData.balance + TOKENS_TO_ADD,
                    is_subscribed: true,
                    rollover_limit: NEW_ROLLOVER_LIMIT,
                })
                .eq('user_id', USER_ID_TO_GRANT);

            if (updateTokenError) {
                console.error('Error updating token document:', updateTokenError);
                return;
            }
        } else {
            console.log(`User does not have a token document. Creating one...`);
            const { error: insertTokenError } = await supabase
                .from('user_tokens')
                .insert({
                    user_id: USER_ID_TO_GRANT,
                    balance: TOKENS_TO_ADD,
                    last_refill_at: new Date().toISOString(),
                    rollover_limit: NEW_ROLLOVER_LIMIT,
                    is_subscribed: true,
                });

            if (insertTokenError) {
                console.error('Error creating token document:', insertTokenError);
                return;
            }
        }
        console.log('Token document updated successfully.');

        // --- 3. Final Verification ---
        const { data: finalTokenData, error: finalTokenError } = await supabase
            .from('user_tokens')
            .select('*')
            .eq('user_id', USER_ID_TO_GRANT)
            .single();

        if (finalTokenData) {
            const newBalance = finalTokenData.balance;
            console.log(`\n✅ Success! Package granted to user ${USER_ID_TO_GRANT}.`);
            console.log(`   New token balance: ${newBalance}`);
        } else {
            console.error('Verification failed: Could not read token document after update.', finalTokenError);
        }

    } catch (error) {
        console.error('\n❌ An error occurred while granting the package:', error);
        console.log('Please ensure the script has the correct Supabase project credentials and permissions.');
    }
}

// Execute the script
grantPackage().then(() => {
    // Adding a small delay to allow database writes to settle before exiting.
    setTimeout(() => process.exit(0), 2000);
});