/**
 * Model name normalization and alias resolution
 */

export function normalizeModelName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_.]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Extract canonical hints from model name
 * Removes common provider prefixes/suffixes
 */
export function extractCanonicalHints(
  modelName: string,
  providerSlug: string
): string[] {
  const hints: string[] = [modelName];
  
  // Remove provider prefix if present
  const providerPrefixes = [
    `${providerSlug}/`,
    `${providerSlug}:`,
    `${providerSlug}-`,
  ];
  
  let cleaned = modelName;
  for (const prefix of providerPrefixes) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.slice(prefix.length);
      hints.push(cleaned);
    }
  }
  
  // Remove common suffixes
  const suffixes = ['-latest', ':latest', '-free', ':free'];
  for (const suffix of suffixes) {
    if (cleaned.toLowerCase().endsWith(suffix)) {
      const withoutSuffix = cleaned.slice(0, -suffix.length);
      hints.push(withoutSuffix);
    }
  }
  
  // Add normalized version
  hints.push(normalizeModelName(cleaned));
  
  // Remove duplicates
  return Array.from(new Set(hints));
}

/**
 * Generate canonical slug from display name
 */
export function generateCanonicalSlug(
  organization: string,
  modelName: string
): string {
  const orgSlug = normalizeModelName(organization);
  const nameSlug = normalizeModelName(modelName);
  return `${orgSlug}/${nameSlug}`;
}

/**
 * Parse organization and family from model name
 */
export function parseModelIdentity(modelName: string): {
  organization: string | null;
  family: string | null;
  version: string | null;
} {
  // Common patterns:
  // "gpt-4o" -> OpenAI, GPT-4, o
  // "claude-3-5-sonnet-20241022" -> Anthropic, Claude 3.5, Sonnet
  // "gemini-1.5-pro" -> Google, Gemini, 1.5 Pro
  // "deepseek-r1" -> DeepSeek, R1, null
  
  const lower = modelName.toLowerCase();
  
  // OpenAI models
  if (lower.includes('gpt')) {
    const match = lower.match(/gpt-?(\d+\.?\d*)/);
    return {
      organization: 'OpenAI',
      family: match ? `GPT-${match[1]}` : 'GPT',
      version: lower.includes('turbo') ? 'Turbo' : lower.includes('mini') ? 'Mini' : null,
    };
  }
  
  // Anthropic models
  if (lower.includes('claude')) {
    const match = lower.match(/claude-?(\d+\.?\d*)/);
    return {
      organization: 'Anthropic',
      family: match ? `Claude ${match[1]}` : 'Claude',
      version: lower.includes('sonnet') ? 'Sonnet' : lower.includes('opus') ? 'Opus' : lower.includes('haiku') ? 'Haiku' : null,
    };
  }
  
  // Google models
  if (lower.includes('gemini')) {
    const match = lower.match(/gemini-?(\d+\.?\d*)/);
    return {
      organization: 'Google',
      family: match ? `Gemini ${match[1]}` : 'Gemini',
      version: lower.includes('pro') ? 'Pro' : lower.includes('flash') ? 'Flash' : null,
    };
  }
  
  // DeepSeek models
  if (lower.includes('deepseek')) {
    return {
      organization: 'DeepSeek',
      family: lower.includes('r1') ? 'R1' : lower.includes('v3') ? 'V3' : 'DeepSeek',
      version: null,
    };
  }
  
  // Qwen models
  if (lower.includes('qwen')) {
    const match = lower.match(/qwen-?(\d+\.?\d*)/);
    return {
      organization: 'Alibaba',
      family: match ? `Qwen ${match[1]}` : 'Qwen',
      version: null,
    };
  }
  
  // Meta models
  if (lower.includes('llama')) {
    const match = lower.match(/llama-?(\d+\.?\d*)/);
    return {
      organization: 'Meta',
      family: match ? `Llama ${match[1]}` : 'Llama',
      version: null,
    };
  }
  
  // Mistral models
  if (lower.includes('mistral')) {
    return {
      organization: 'Mistral AI',
      family: 'Mistral',
      version: lower.includes('large') ? 'Large' : lower.includes('small') ? 'Small' : null,
    };
  }
  
  // Default: unknown
  return {
    organization: null,
    family: null,
    version: null,
  };
}
