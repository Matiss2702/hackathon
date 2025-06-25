export interface JwtPayload {
  sub: string;
  email: string;
  firstname: string;
  lastname: string;
}

export interface Role {
  id: string;
  name: string;
  power: number;
}
