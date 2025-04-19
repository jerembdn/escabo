export type RateLimitConfig = {
  requests: number;
  seconds: number;
};

export type EndpointRateLimits = {
  [key: string]: RateLimitConfig;
};
