const API_BASE = '/api/v1';

export async function getVilles(search) {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/villes${params}`);
  if (!res.ok) throw new Error('Erreur chargement des villes');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getVilleById(id) {
  const res = await fetch(`${API_BASE}/villes/${id}`);
  if (!res.ok) throw new Error('Ville non trouvée');
  return res.json();
}
