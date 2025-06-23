export interface JwtPayload {
  sub: string;
  email: string;
  firstname: string;
  lastname: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  power: number;
}
