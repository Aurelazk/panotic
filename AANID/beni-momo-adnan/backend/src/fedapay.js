// Intégration FedaPay (Mobile Money MTN/Moov + cartes — Bénin / Afrique de l'Ouest).
// Configuration par variables d'environnement :
//   FEDAPAY_SECRET_KEY   : clé secrète (sk_sandbox_... ou sk_live_...)
//   FEDAPAY_ENVIRONMENT  : 'sandbox' (défaut) ou 'live'
// Sans clé configurée, les routes de paiement basculent en mode simulation.

const ENV = process.env.FEDAPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox';
const BASE_URL = ENV === 'live'
  ? 'https://api.fedapay.com/v1'
  : 'https://sandbox-api.fedapay.com/v1';

function isConfigured() {
  return Boolean(process.env.FEDAPAY_SECRET_KEY) && typeof fetch === 'function';
}

async function fedapayFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error || `FedaPay HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function unwrap(data, key) {
  return data?.[`v1/${key}`] || data?.[key] || data;
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/[^0-9]/g, '');
  // Numéro local béninois (8 ou 10 chiffres) → format international
  if (digits.length <= 10 && !digits.startsWith('229')) return `+229${digits}`;
  return `+${digits}`;
}

/**
 * Crée une transaction FedaPay et retourne l'URL de paiement hébergée.
 * @returns {{ transactionId: number, paymentUrl: string }}
 */
async function createTransaction({ amount, description, phone, callbackUrl }) {
  const body = {
    description,
    amount: Math.round(amount),
    currency: { iso: 'XOF' },
    customer: {
      phone_number: { number: normalizePhone(phone), country: 'bj' },
    },
  };
  if (callbackUrl) body.callback_url = callbackUrl;

  const created = await fedapayFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const transaction = unwrap(created, 'transaction');

  const tokenData = await fedapayFetch(`/transactions/${transaction.id}/token`, {
    method: 'POST',
  });

  return {
    transactionId: transaction.id,
    paymentUrl: tokenData.url,
  };
}

/**
 * Retourne le statut FedaPay d'une transaction :
 * 'pending' | 'approved' | 'declined' | 'canceled' | 'transferred' | ...
 */
async function getTransactionStatus(transactionId) {
  const data = await fedapayFetch(`/transactions/${transactionId}`);
  return unwrap(data, 'transaction').status;
}

function isPaidStatus(status) {
  return status === 'approved' || status === 'transferred';
}

function isFailedStatus(status) {
  return status === 'declined' || status === 'canceled' || status === 'expired';
}

module.exports = {
  isConfigured,
  createTransaction,
  getTransactionStatus,
  isPaidStatus,
  isFailedStatus,
  ENV,
};
