export function isZodSchema(
  value: unknown
): value is { toJSONSchema: (params?: { target?: string }) => unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toJSONSchema' in value &&
    typeof value['toJSONSchema'] === 'function'
  );
}

export function toJsonSchema(schema: unknown) {
  if (!isZodSchema(schema)) {
    return schema;
  }
  return schema.toJSONSchema({ target: 'openApi3' });
}
