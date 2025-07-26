import { decodeJwt } from "jose"

interface DecodedPayload {
  email: string
  role: string
}

export function decodeJWT(token: string): DecodedPayload {
  const payload = decodeJwt(token)
  return payload as unknown as DecodedPayload
}