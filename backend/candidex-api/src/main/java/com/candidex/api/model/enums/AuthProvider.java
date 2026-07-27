package com.candidex.api.model.enums;

/**
 * How a user authenticates.
 * LOCAL  = email + password managed by Candidex.
 * GOOGLE = reserved for future Google OAuth sign-in.
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE
}
