
// A central configuration file for application-wide settings.

export const betaConfig = {
    // Set this to `false` to disable the beta program.
    // When true, all new users are treated as subscribed and receive bonus tokens.
    // When false, the standard free/paid logic applies.
    isActive: true, 

    // Settings for new users when beta is active
    newUserTokens: 50,
    newUserIsSubscribed: true,
    newUserRolloverLimit: 50,

    // Settings for monthly refill when beta is active
    refillAmount: 50,
};

// Standard settings when beta is NOT active
export const standardConfig = {
    freeUser: {
        newUserTokens: 10,
        newUserIsSubscribed: false,
        newUserRolloverLimit: 10,
        refillAmount: 10,
    },
    subscribedUser: {
        refillAmount: 150,
        rollover_limit: 150,
    }
}
