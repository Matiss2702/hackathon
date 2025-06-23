export interface JWTPayload {
  firstname: string;
  lastname: string;
  email: string;
  sub: string;
  roles: Role[];
  [key: string]: unknown;
}

export interface Role {
  id: string;
  name: string;
  power: number;
}

export async function decodeJWT(token: string): Promise<JWTPayload | null> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // facultatif, pour simuler délai

  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.warn('Token mal formé : mauvaise structure');
      return null;
    }

    let payloadBase64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += '=';
    }

    const json = atob(payloadBase64);
    return JSON.parse(json);
  } catch (error) {
    console.error('Erreur lors du décodage du token JWT:', error);
    return null;
  }
}
