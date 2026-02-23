import { ReadonlyJSONObject } from './consts';

export const areToolArgsValid = (
  args: Record<string, unknown>
): args is ReadonlyJSONObject => {
  return Object.values(args).every(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      (typeof value === 'string' ||
        value === null ||
        value === undefined ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        Array.isArray(value))
  );
};
