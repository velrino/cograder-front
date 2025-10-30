export enum Environments {
  RELEASE = "RELEASE",
  PRODUCTION = "PRODUCTION",
}

export function GetEnvironment(): string {
  return (process.env.NEXT_PUBLIC_NODE_ENV || "DEVELOP").toUpperCase();
}

export const LockKeyName = (lockKeyName: string): string => {
  const env = GetEnvironment();

  const lockKey = Object.values(Environments).includes(env as Environments)
    ? lockKeyName
    : `DEV_${lockKeyName.toUpperCase()}`;

  return lockKey;
};
