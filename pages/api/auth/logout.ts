import { serialize } from "cookie"
import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Set-Cookie", [
        serialize("accessToken", "", {
            path: "/",
            httpOnly: true,
            expires: new Date(0),
        }),
    ])

    res.status(200).json({ message: "Logged Out" })
}
