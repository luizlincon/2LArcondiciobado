const digits = (v: string | undefined) => (v ?? '').replace(/\D/g, '')

export const config = {
  whatsappNumber: digits(import.meta.env.VITE_WHATSAPP_NUMBER) || '5561994415050',
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) ?? '',
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '',
}

export const isBackendConfigured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey)

/** Modo demonstração: dados ficam só no navegador. Ativo em dev, ou em build com VITE_DEMO_MODE=true, e só sem backend. */
export const isDemoMode = () =>
  !isBackendConfigured() && (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true')
