
// To run this script, use the command: npx tsx scripts/grant-package.ts

import { db } from '../src/lib/firebase';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
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

    const userRef = doc(db, 'users', USER_ID_TO_GRANT);
    const tokenRef = doc(db, 'user_tokens', USER_ID_TO_GRANT);

    try {
        // --- 1. Update User Profile ---
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            console.error(`Error: User profile not found for ID: ${USER_ID_TO_GRANT}. Cannot grant package.`);
            return;
        }
        
        console.log('Updating user profile to set is_subscribed = true...');
        await updateDoc(userRef, { is_subscribed: true });
        console.log('User profile updated successfully.');

        // --- 2. Update Token Document ---
        const tokenSnap = await getDoc(tokenRef);
        if (tokenSnap.exists()) {
            console.log(`User has existing token document. Adding ${TOKENS_TO_ADD} tokens...`);
            await updateDoc(tokenRef, {
                balance: increment(TOKENS_TO_ADD),
                is_subscribed: true,
                rollover_limit: NEW_ROLLOVER_LIMIT,
            });
        } else {
            console.log(`User does not have a token document. Creating one...`);
            await setDoc(tokenRef, {
                balance: TOKENS_TO_ADD,
                last_refill_at: serverTimestamp(),
                rollover_limit: NEW_ROLLOVER_LIMIT,
                is_subscribed: true,
            });
        }
        console.log('Token document updated successfully.');
        
        // --- 3. Final Verification ---
        const finalTokenSnap = await getDoc(tokenRef);
        if (finalTokenSnap.exists()) {
            const newBalance = (finalTokenSnap.data() as UserToken).balance;
            console.log(`\n✅ Success! Package granted to user ${USER_ID_TO_GRANT}.`);
            console.log(`   New token balance: ${newBalance}`);
        } else {
             throw new Error('Verification failed: Could not read token document after update.');
        }

    } catch (error) {
        console.error('\n❌ An error occurred while granting the package:', error);
        console.log('Please ensure the script has the correct Firebase project credentials and Firestore permissions.');
    }
}

// Execute the script
grantPackage().then(() => {
    // Adding a small delay to allow Firestore writes to settle before exiting.
    setTimeout(() => process.exit(0), 2000);
});
