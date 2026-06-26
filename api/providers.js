// api/providers.js
// Provider database — stored in Vercel KV
// GET: public (no PIN needed — providers are not sensitive data)
// POST (create/update) and DELETE: require admin PIN

import { kv } from '@vercel/kv';

const KEY = 'dmoh_providers_v1';

// Fallback in-memory store for local development without KV
let localStore = [
  {
    id: 'sample1',
    firstName: 'Sarah',
    lastName: 'Chen',
    specialty: 'Medical Oncology',
    cpso: '123456',
    tel: '416-555-0101',
    fax: '416-555-0102',
    email: 's.chen@uhn.ca',
    hospital: 'Princess Margaret Cancer Centre',
  },
];

const hasKV = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const getAll = async () => {
  if (hasKV()) {
    return (await kv.get(KEY)) || [];
  }
  return localStore;
};

const setAll = async (providers) => {
  if (hasKV()) {
    await kv.set(KEY, providers);
  } else {
    localStore = providers;
  }
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // GET — return all providers
    if (req.method === 'GET') {
      const providers = await getAll();
      return res.status(200).json(providers);
    }

    // POST — create or update a provider (requires PIN)
    if (req.method === 'POST') {
      const { pin, provider } = req.body || {};
      if (!pin || pin !== process.env.ADMIN_PIN) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      if (!provider || !provider.firstName || !provider.lastName || !provider.cpso) {
        return res.status(400).json({ error: 'Missing required provider fields' });
      }

      const providers = await getAll();
      const exists = providers.find(p => p.id === provider.id);
      let updated;

      if (exists) {
        updated = providers.map(p => (p.id === provider.id ? provider : p));
      } else {
        updated = [...providers, { ...provider, id: Date.now().toString() }];
      }

      await setAll(updated);
      return res.status(200).json(updated);
    }

    // DELETE — remove a provider (requires PIN)
    if (req.method === 'DELETE') {
      const { pin, id } = req.body || {};
      if (!pin || pin !== process.env.ADMIN_PIN) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      if (!id) {
        return res.status(400).json({ error: 'Provider ID required' });
      }

      const providers = await getAll();
      const updated = providers.filter(p => p.id !== id);
      await setAll(updated);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Providers API error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
