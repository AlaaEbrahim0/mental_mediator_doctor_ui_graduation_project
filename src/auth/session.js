// Single source of truth for the persisted auth session.
//
// Every part of the app (axios interceptor, SignalR token factory, route
// guards) used to read/write `localStorage` independently, which let the
// session drift out of sync with React state. These helpers keep the storage
// and the in-memory state consistent.

const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";
const ROLES_KEY = "roles";
const EXPIRES_ON_KEY = "expiresOn";

const safeParseRoles = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const getToken = () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
};

export const getRoles = () => {
    if (typeof window === "undefined") return [];
    return safeParseRoles(window.localStorage.getItem(ROLES_KEY));
};

export const readSession = () => {
    if (typeof window === "undefined") {
        return { token: null, userId: null, roles: [], expiresOn: null };
    }
    return {
        token: window.localStorage.getItem(TOKEN_KEY),
        userId: window.localStorage.getItem(USER_ID_KEY),
        roles: safeParseRoles(window.localStorage.getItem(ROLES_KEY)),
        expiresOn: window.localStorage.getItem(EXPIRES_ON_KEY),
    };
};

export const saveSession = ({ token, userId, roles, expiresOn }) => {
    if (typeof window === "undefined") return;
    if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
    } else {
        window.localStorage.removeItem(TOKEN_KEY);
    }

    if (userId) {
        window.localStorage.setItem(USER_ID_KEY, userId);
    } else {
        window.localStorage.removeItem(USER_ID_KEY);
    }

    if (Array.isArray(roles)) {
        window.localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    } else {
        window.localStorage.removeItem(ROLES_KEY);
    }

    if (expiresOn) {
        window.localStorage.setItem(EXPIRES_ON_KEY, expiresOn);
    } else {
        window.localStorage.removeItem(EXPIRES_ON_KEY);
    }
};

export const clearSession = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_ID_KEY);
    window.localStorage.removeItem(ROLES_KEY);
    window.localStorage.removeItem(EXPIRES_ON_KEY);
};

export { TOKEN_KEY, USER_ID_KEY, ROLES_KEY, EXPIRES_ON_KEY };
