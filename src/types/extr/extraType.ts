/* eslint-disable @typescript-eslint/no-explicit-any */


export type DecodedToken = {
  exp: number; // expiration timestamp (in seconds since epoch)
  iat?: number; // issued at (optional, depends on your JWT)
  [key: string]: any; // allow other JWT claims
};