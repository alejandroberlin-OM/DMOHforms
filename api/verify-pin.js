// api/verify-pin.js
// Validates the admin PIN server-side so the PIN never lives in the browser

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin } = req.body || {};

  if (!pin) {
    return res.status(400).json({ valid: false, error: 'PIN required' });
  }

  if (pin === process.env.ADMIN_PIN) {
    return res.status(200).json({ valid: true });
  }

  // Small delay to slow brute-force attempts
  return new Promise(resolve =>
    setTimeout(() => {
      res.status(401).json({ valid: false, error: 'Incorrect PIN' });
      resolve();
    }, 800)
  );
}
