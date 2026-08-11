export type SupabaseServerEnvironment = Readonly<
  Record<string, string | undefined>
>;

export type SupabaseServerConfig = {
  readonly url: string;
  readonly serviceRoleKey: string;
};

export class SupabaseConfigurationError extends Error {
  readonly code = "CONFIGURATION_ERROR" as const;

  constructor() {
    super("Supabase server configuration is missing or invalid.");
    this.name = "SupabaseConfigurationError";
  }
}

function parseServerUrl(value?: string) {
  if (!value?.trim()) {
    throw new SupabaseConfigurationError();
  }

  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      throw new SupabaseConfigurationError();
    }
    return url.toString();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw error;
    }
    throw new SupabaseConfigurationError();
  }
}

export function getSupabaseServerConfig(
  environment: SupabaseServerEnvironment = process.env,
): SupabaseServerConfig {
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new SupabaseConfigurationError();
  }

  return {
    url: parseServerUrl(environment.SUPABASE_URL),
    serviceRoleKey,
  };
}
