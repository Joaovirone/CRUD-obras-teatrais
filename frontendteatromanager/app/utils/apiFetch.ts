// centraliza requisições com token e base URL

const API_BASE = 'http://localhost:5002/api/v1';

export const getCleanToken = (): string => {
  const raw = localStorage.getItem('userToken');
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    const token = typeof parsed === 'object' ? parsed.token : parsed;
    return token.replace(/^"|"$/g, '').trim();
  } catch {
    return raw.replace(/^"|"$/g, '').trim();
  }
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getCleanToken();
  const headers = new Headers(options.headers || {});
  
  // garantir content-type quando houver body
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    const response = await fetch(API_BASE + path, { ...options, headers });
    
    // DEBUG: log completo de erros
    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type');
        let errorBody = '';
        
        if (contentType && contentType.includes('application/json')) {
          errorBody = JSON.stringify(await response.json(), null, 2);
        } else {
          errorBody = await response.text();
        }
        
        console.error(`[API ERROR ${response.status}] ${path}:`, errorBody);
      } catch (parseError) {
        console.error(`[API ERROR ${response.status}] ${path}: Erro ao parsear resposta`);
      }
    }
    
    return response;
  } catch (networkError) {
    console.error(`[NETWORK ERROR] ${path}:`, networkError);
    throw networkError;
  }
}
