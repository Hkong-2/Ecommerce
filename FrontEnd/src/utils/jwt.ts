type JwtPayload = {
  exp?: number;
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = window.atob(normalizedPayload);

    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const isJwtExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now();
};
