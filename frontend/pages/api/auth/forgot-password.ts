import { recoverPassword } from '@/lib/slices/authSlice';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;
    try {
      const result = await recoverPassword(email);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send recovery email.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
