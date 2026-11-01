/**
 * Repairs the shape of model output before strict validation. The model understands the request;
 * these rules only absorb naming and formatting drift (field synonyms, spoken or localized amounts)
 * that would otherwise reject a correct interpretation with a 502.
 */

export const ACTION_FIELD_NAMES = [
  'type',
  'amount',
  'title',
  'merchant',
  'currencyCode',
  'categoryId',
  'categoryName',
  'walletId',
  'walletName',
  'date',
  'note',
  'paymentMethod',
  'transcript',
  'name',
  'periodType',
  'startDate',
  'endDate',
  'isActive',
  'alertThresholdPercent',
  'annualInterestRateBps',
  'minimumPayment',
  'movementId',
  'person',
  'method',
  'frequency',
  'dueDayOfMonth',
  'nextDueDate',
  'purpose',
  'plannedContribution',
  'targetDate',
  'parentId',
  'reason',
  'institution',
] as const;

const ALIASES: Record<string, string> = {
  category: 'categoryName',
  categoria: 'categoryName',
  categorie: 'categoryName',
  wallet: 'walletName',
  account: 'walletName',
  cuenta: 'walletName',
  billetera: 'walletName',
  description: 'title',
  descripcion: 'title',
  concept: 'title',
  concepto: 'title',
  detail: 'title',
  currency: 'currencyCode',
  moneda: 'currencyCode',
  store: 'merchant',
  shop: 'merchant',
  comercio: 'merchant',
  tienda: 'merchant',
  monto: 'amount',
  valor: 'amount',
  importe: 'amount',
  value: 'amount',
  fecha: 'date',
  nota: 'note',
  notes: 'note',
  metodo: 'paymentMethod',
  payment: 'paymentMethod',
  limit: 'amount',
  goal: 'amount',
  balance: 'amount',
  initialbalance: 'amount',
  nombre: 'name',
};

/** In debts the creditor is the record name; in loans the debtor is the person. */
const ENTITY_ALIASES: Record<string, Record<string, string>> = {
  TRANSACTION: { name: 'title', nombre: 'title', titulo: 'title' },
  DEBT: {
    creditor: 'name',
    acreedor: 'name',
    person: 'name',
    persona: 'name',
    title: 'name',
  },
  LOAN: {
    debtor: 'person',
    deudor: 'person',
    persona: 'person',
    name: 'person',
  },
  WALLET: { title: 'name' },
  CATEGORY: { title: 'name' },
  BUDGET: { title: 'name' },
  SAVINGS: { title: 'name' },
  INVESTMENT: { title: 'name' },
};

const MONEY_FIELDS = ['amount', 'minimumPayment', 'plannedContribution'];
const ESSENTIAL_FIELDS = new Set([
  'amount',
  'person',
  'name',
  'institution',
  'parentId',
  'movementId',
]);

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * «15.000», «15,000», «20,50», «1.500,75», «15 mil», «20 lucas», «1.5k», «2 millones», «$ 20» → canonical decimal.
 * A single separator followed by exactly three digits is read as a thousands separator.
 */
export function canonicalAmount(raw: string): string | null {
  const text = raw.toLowerCase().trim();
  const words = ` ${text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/([0-9])([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')} `;
  const multiplier = /\s(millones|millon|millions|million|mill|mio|m)\s/.test(
    words,
  )
    ? 1_000_000
    : /\s(mil|lucas|luca|k|thousand|mille|tausend)\s/.test(words)
      ? 1_000
      : 1;
  const match = /[0-9](?:[0-9.,' ]*[0-9])?/.exec(text);
  if (!match) return null;
  const number = match[0].replace(/[' ]/g, '');
  const dots = (number.match(/\./g) ?? []).length;
  const commas = (number.match(/,/g) ?? []).length;
  let canonical: string;
  if (dots && commas) {
    canonical =
      number.lastIndexOf('.') > number.lastIndexOf(',')
        ? number.replace(/,/g, '')
        : number.replace(/\./g, '').replace(',', '.');
  } else if (!dots && !commas) {
    canonical = number;
  } else {
    const separator = dots ? '.' : ',';
    const decimals = number.slice(number.lastIndexOf(separator) + 1);
    canonical =
      dots + commas > 1 || (decimals.length === 3 && multiplier === 1)
        ? number.split(separator).join('')
        : number.replace(separator, '.');
  }
  if (!/^[0-9]+(?:\.[0-9]+)?$/.test(canonical)) return null;
  const [whole, fraction = ''] = canonical.split('.');
  // Scale with string arithmetic so large amounts keep every digit.
  const zeros = String(multiplier).length - 1;
  const shift = Math.min(zeros, fraction.length);
  const scaledWhole = (
    whole +
    fraction.slice(0, shift) +
    '0'.repeat(zeros - shift)
  ).replace(/^0+(?=\d)/, '');
  const scaledFraction = fraction.slice(shift).replace(/0+$/, '');
  return scaledFraction ? `${scaledWhole}.${scaledFraction}` : scaledWhole;
}

type Field = { name: string; value: string };
type Action = {
  entity?: unknown;
  fields?: unknown;
  missingFields?: unknown;
  [key: string]: unknown;
};

function normalizeAction(action: Action): void {
  const entity = typeof action.entity === 'string' ? action.entity : '';
  if (Array.isArray(action.fields)) {
    const byName = new Map<string, Field>();
    const conflicts: Field[] = [];
    const known = new Set<string>(ACTION_FIELD_NAMES);
    for (const raw of action.fields as unknown[]) {
      if (!raw || typeof raw !== 'object') continue;
      const field = raw as Record<string, unknown>;
      if (typeof field.name !== 'string') continue;
      const value =
        typeof field.value === 'string'
          ? field.value
          : typeof field.value === 'number' || typeof field.value === 'boolean'
            ? String(field.value)
            : '';
      const key = fold(field.name);
      const name =
        ENTITY_ALIASES[entity]?.[key] ??
        (known.has(field.name) ? field.name : undefined) ??
        ACTION_FIELD_NAMES.find((n) => fold(n) === key) ??
        ALIASES[key] ??
        field.name;
      const previous = byName.get(name);
      // An explicit canonical field wins over a synonym the model also emitted.
      if (previous && name !== field.name) continue;
      // Two different values for the same field (e.g. amount 10 and 20) are a real ambiguity: keep both
      // so validation rejects the plan instead of silently picking one amount.
      if (previous && previous.value !== value) conflicts.push({ name, value });
      else byName.set(name, { name, value });
    }
    const missing = new Set(
      Array.isArray(action.missingFields)
        ? (action.missingFields as unknown[]).filter(
            (f): f is string => typeof f === 'string',
          )
        : [],
    );
    for (const key of MONEY_FIELDS) {
      const field = byName.get(key);
      if (!field) continue;
      if (!field.value.trim()) {
        byName.delete(key);
        continue;
      }
      const amount = canonicalAmount(field.value);
      if (amount) field.value = amount;
      else {
        // Unreadable amounts become a question for the user instead of an invalid response.
        byName.delete(key);
        if (key === 'amount') missing.add('amount');
      }
    }
    action.fields = [...byName.values(), ...conflicts];
    action.missingFields = [...missing]
      .map((f) => ALIASES[fold(f)] ?? f)
      .filter((f) => ESSENTIAL_FIELDS.has(f) && !byName.get(f)?.value.trim());
  } else if (!Array.isArray(action.missingFields)) {
    action.missingFields = [];
  }
}

export function normalizeModelOutput(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const output = value as Record<string, unknown>;
  if (Array.isArray(output.actions))
    for (const action of output.actions)
      if (action && typeof action === 'object' && !Array.isArray(action))
        normalizeAction(action as Action);
  if (Array.isArray(output.queries))
    for (const query of output.queries) {
      if (!query || typeof query !== 'object' || Array.isArray(query)) continue;
      const q = query as Record<string, unknown>;
      if (typeof q.offset === 'string' && /^\d+$/.test(q.offset))
        q.offset = Number(q.offset);
      for (const key of [
        'startDate',
        'endDate',
        'search',
        'categoryId',
        'walletId',
        'parentId',
      ])
        if (q[key] == null) q[key] = '';
    }
  return output;
}
