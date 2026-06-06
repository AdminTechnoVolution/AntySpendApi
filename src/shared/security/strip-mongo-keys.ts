function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasDangerousKey(key: string): boolean {
  return key.startsWith('$') || key.includes('.');
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) =>
      isPlainObject(item) ? sanitizeDocumentForStorage(item) : item,
    );
  }
  if (isPlainObject(value)) {
    return sanitizeDocumentForStorage(value);
  }
  return value;
}

/** Deep strip keys starting with `$` or containing `.` before MongoDB writes. */
export function sanitizeDocumentForStorage(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (hasDangerousKey(key)) {
      continue;
    }
    result[key] = sanitizeValue(value);
  }
  return result;
}

export function containsMongoOperatorKeys(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsMongoOperatorKeys);
  }
  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (hasDangerousKey(key) || containsMongoOperatorKeys(nested)) {
        return true;
      }
    }
  }
  return false;
}
