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

/** Mutates a record in place (for read-only refs such as req.query in Express 5). */
export function sanitizeRecordInPlace(record: Record<string, unknown>): void {
  for (const key of Object.keys(record)) {
    if (hasDangerousKey(key)) {
      delete record[key];
      continue;
    }
    const value = record[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isPlainObject(item)) {
          sanitizeRecordInPlace(item);
        }
      }
    } else if (isPlainObject(value)) {
      sanitizeRecordInPlace(value);
    }
  }
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
