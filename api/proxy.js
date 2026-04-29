// ═══════════════════════════════════════════════════
//  VERCEL API ROUTE — proxy.js
//  Caminho: /api/proxy.js (na raiz do projeto)
//
//  IMPORTANTE: usa module.exports (CommonJS)
//  que é o padrão do Vercel sem package.json
// ═══════════════════════════════════════════════════

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwv4uvPuy68Owsg8dGUWPf7Vu9BmabyFgm6JdSRnJ_DtQvudojSjXUZztX4hca2PEUl/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let response;

    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query).toString();
      const url = params ? `${APPS_SCRIPT_URL}?${params}` : APPS_SCRIPT_URL;
      response = await fetch(url, { redirect: 'follow' });

    } else if (req.method === 'POST') {
      // req.body já vem parseado pelo Vercel quando Content-Type é application/json
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        redirect: 'follow',
      });

    } else {
      return res.status(405).json({ status: 'erro', msg: 'método não permitido' });
    }

    // Lê a resposta como texto primeiro (Apps Script às vezes retorna HTML em caso de erro)
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      // Apps Script retornou algo que não é JSON (erro de autenticação, etc.)
      console.error('Resposta não-JSON do Apps Script:', text.slice(0, 300));
      return res.status(502).json({
        status: 'erro',
        msg: 'Apps Script retornou resposta inválida. Verifique se o script está implantado corretamente.',
        detalhe: text.slice(0, 200)
      });
    }

  } catch (error) {
    console.error('Erro no proxy:', error.message);
    return res.status(500).json({ status: 'erro', msg: error.message });
  }
};
