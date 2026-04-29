// ═══════════════════════════════════════════════════
//  VERCEL API ROUTE — PROXY para o Google Apps Script
//  Arquivo: /api/proxy.js  (na raiz do seu projeto)
//
//  Por que isso existe?
//  O Google Apps Script bloqueia requisições diretas
//  de outros domínios (CORS). Esta rota fica no mesmo
//  domínio do HTML, então o browser não bloqueia.
// ═══════════════════════════════════════════════════

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwv4uvPuy68Owsg8dGUWPf7Vu9BmabyFgm6JdSRnJ_DtQvudojSjXUZztX4hca2PEUl/exec';

export default async function handler(req, res) {
  // Permite qualquer origem (mesmo domínio já resolve, mas boa prática)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let appsScriptResponse;

    // ── GET: carregar rascunho ──────────────────────
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query).toString();
      const url = params ? `${APPS_SCRIPT_URL}?${params}` : APPS_SCRIPT_URL;

      appsScriptResponse = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
      });
    }

    // ── POST: salvar rascunho ou enviar respostas ───
    else if (req.method === 'POST') {
      appsScriptResponse = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow',
      });
    }

    // Método não suportado
    else {
      return res.status(405).json({ status: 'erro', msg: 'método não permitido' });
    }

    const data = await appsScriptResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ status: 'erro', msg: error.message });
  }
}
