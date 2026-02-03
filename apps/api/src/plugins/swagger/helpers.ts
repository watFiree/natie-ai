function convertNullable(schema: unknown): unknown {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  // Handle anyOf with null type (Zod nullable output) -> convert to nullable: true
  if (
    'anyOf' in schema &&
    Array.isArray((schema as { anyOf: unknown[] }).anyOf)
  ) {
    const anyOf = (schema as { anyOf: unknown[] }).anyOf;
    // Check if one of the items is type: null
    const nullIndex = anyOf.findIndex(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        (item as { type: string }).type === 'null'
    );
    if (nullIndex !== -1) {
      // Get the non-null schema
      const nonNullSchema = anyOf.find(
        (item, index) =>
          index !== nullIndex && typeof item === 'object' && item !== null
      );
      if (nonNullSchema) {
        // Convert to nullable format
        const converted = convertNullable(nonNullSchema) as Record<
          string,
          unknown
        >;
        return {
          ...converted,
          nullable: true,
        };
      }
    }
  }

  // Handle oneOf with null type similarly
  if (
    'oneOf' in schema &&
    Array.isArray((schema as { oneOf: unknown[] }).oneOf)
  ) {
    const oneOf = (schema as { oneOf: unknown[] }).oneOf;
    const nullIndex = oneOf.findIndex(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        (item as { type: string }).type === 'null'
    );
    if (nullIndex !== -1) {
      const nonNullSchema = oneOf.find(
        (item, index) =>
          index !== nullIndex && typeof item === 'object' && item !== null
      );
      if (nonNullSchema) {
        const converted = convertNullable(nonNullSchema) as Record<
          string,
          unknown
        >;
        return {
          ...converted,
          nullable: true,
        };
      }
    }
  }

  // Recursively process object properties
  if ('properties' in schema && typeof schema.properties === 'object') {
    const properties = schema.properties as Record<string, unknown>;
    const convertedProperties: Record<string, unknown> = {};
    for (const key of Object.keys(properties)) {
      convertedProperties[key] = convertNullable(properties[key]);
    }
    return {
      ...schema,
      properties: convertedProperties,
    };
  }

  // Recursively process array items
  if ('items' in schema) {
    return {
      ...schema,
      items: convertNullable(schema.items),
    };
  }

  // Recursively process additionalProperties if it's a schema
  if (
    'additionalProperties' in schema &&
    typeof schema.additionalProperties === 'object' &&
    schema.additionalProperties !== null
  ) {
    return {
      ...schema,
      additionalProperties: convertNullable(schema.additionalProperties),
    };
  }

  return schema;
}

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
  const jsonSchema = schema.toJSONSchema({ target: 'openApi3' });
  return convertNullable(jsonSchema);
}
