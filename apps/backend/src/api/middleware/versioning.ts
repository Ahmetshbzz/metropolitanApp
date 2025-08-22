export const getApiPrefix = (): string => {
  return process.env.API_PREFIX ?? '/api/v1';
};

export const getApiVersion = (): string => {
  return process.env.API_VERSION ?? '1.0.0';
};

export const getInstanceId = (): string => {
  return process.env.INSTANCE_ID ?? 'local';
};

// API response wrapper with versioning info
export const apiResponse = <T>(data: T, meta?: Record<string, unknown>): { data: T; meta: Record<string, unknown> } => {
  return {
    data,
    meta: {
      version: getApiVersion(),
      instance: getInstanceId(),
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
};
