export function parseDateUTC(dateString) {
  if (!dateString) return new Date()
  
  // Se a string já vier com indicação de timezone UTC ('Z'), usa direto.
  // Caso contrário, adicionamos 'Z' para o navegador saber que a string original 
  // veio em UTC do backend (comum com FastAPI + PostgreSQL/Supabase).
  const raw = dateString.endsWith('Z') ? dateString : `${dateString}Z`
  return new Date(raw)
}
