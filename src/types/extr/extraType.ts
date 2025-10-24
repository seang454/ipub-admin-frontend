export type DecodedToken = {
  exp: number; // expiration timestamp (in seconds since epoch)
  iat?: number; // issued at (optional, depends on your JWT)
  [key: string]: unknown; // allow other JWT claims
};
