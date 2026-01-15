export function getJwtExpMs(token: string): number | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;

        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const expSec = json?.exp;
        if (typeof expSec !== 'number') return null;

        return expSec * 1000;
    } catch {
        return null;
    }
}

export function willExpireWithinMs(token: string, withinMs: number): boolean {
    const expMs = getJwtExpMs(token);
    if (!expMs) return false; // if we can't read exp, don't proactively refresh
    return expMs - Date.now() <= withinMs;
}