const { getApiBaseUrl } = require('@aanid/shared/api');
const API_BASE = getApiBaseUrl();

async function getVilles(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/villes${params}`);
  if (!res.ok) throw new Error('Erreur chargement villes');
  return res.json();
}

async function getVilleById(id) {
  const res = await fetch(`${API_BASE}/villes/${id}`);
  if (!res.ok) throw new Error('Ville introuvable');
  return res.json();
}

module.exports = { getVilles, getVilleById };
