export function assertEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

// 🧠 Age Detection System
export * from './age-detection';
