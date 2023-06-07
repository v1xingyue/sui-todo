
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const body = req.body;
    res.status(200).json({
        body
    })
}