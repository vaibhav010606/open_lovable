export type Provider = 'gemini' | 'claude' | 'openai';

export interface AIConfig {
  provider: Provider;
  apiKey: string;
}

export const PROVIDER_MODELS: Record<Provider, string> = {
  gemini: 'gemini-2.5-flash',
  claude: 'claude-3-5-sonnet-latest',
  openai: 'gpt-4o',
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  gemini: 'Google Gemini',
  claude: 'Anthropic Claude',
  openai: 'OpenAI GPT-4o',
};

export const PROVIDER_KEY_LINKS: Record<Provider, string> = {
  gemini: 'https://aistudio.google.com/app/apikey',
  claude: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
};

export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') return { provider: 'gemini', apiKey: '' };
  const stored = localStorage.getItem('ai_config');
  if (stored) return JSON.parse(stored);
  return { provider: 'gemini', apiKey: '' };
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem('ai_config', JSON.stringify(config));
}
