// js/api.js

// Configuração da URL base da API (Backend)
const API_URL = 'http://localhost:3000';

// Função genérica para padronizar todas as chamadas (GET, POST, PUT, DELETE)
async function fetchAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    // Executa a requisição e converte a resposta para JSON
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error('Erro na API:', error);
    return { ok: false, data: { error: 'Erro de conexão com o servidor' } };
  }
}