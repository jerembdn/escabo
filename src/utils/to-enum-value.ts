export function toEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: string,
): keyof T | undefined {
  const lowerInput = value.toLowerCase();

  return Object.values(enumObj).find(
    (val) => val.toLowerCase() === lowerInput,
  ) as T[keyof T] | undefined;
}
