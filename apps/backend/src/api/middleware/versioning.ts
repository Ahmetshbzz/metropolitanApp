export const getApiPrefix = () => {
  return process.env.API_PREFIX || '/api/v1';
};

export const getApiVersion = () => {
  return process.env.API_VERSION || '1.0.0';
};

export const getInstanceId = () => {
  return process.env.INSTANCE_ID || 'local';
};

// API response wrapper with versioning info
export const apiResponse = <T>(data: T, meta?: Record<string, any>) => {
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
