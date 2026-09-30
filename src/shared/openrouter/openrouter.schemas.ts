const RECEIPT_FIELD_EVIDENCE_SCHEMA = {
  type: 'object',
  properties: {
    value: { type: ['string', 'null'], maxLength: 100 },
    sourceText: { type: ['string', 'null'], maxLength: 100 },
    confidence: { type: ['number', 'null'], minimum: 0, maximum: 1 },
    reason: { type: ['string', 'null'], maxLength: 120 },
  },
  required: ['value', 'sourceText', 'confidence', 'reason'],
  additionalProperties: false,
} as const;

const CURRENCY_MATCH_SCHEMA = {
  type: 'object',
  properties: {
    catalogId: { type: ['string', 'null'] },
    code: { type: ['string', 'null'] },
    name: { type: ['string', 'null'] },
    rawValue: { type: ['string', 'null'] },
    matchType: {
      type: 'string',
      enum: [
        'EXACT_MATCH',
        'SEMANTIC_MATCH',
        'DEFAULT_VALUE',
        'UNMATCHED',
        'NOT_PROVIDED',
      ],
    },
  },
  required: ['catalogId', 'code', 'name', 'rawValue', 'matchType'],
  additionalProperties: false,
} as const;

const CATALOG_MATCH_SCHEMA = {
  type: 'object',
  properties: {
    catalogId: { type: ['string', 'null'] },
    name: { type: ['string', 'null'] },
    rawValue: { type: ['string', 'null'] },
    matchType: {
      type: 'string',
      enum: ['EXACT_MATCH', 'SEMANTIC_MATCH', 'UNMATCHED', 'NOT_PROVIDED'],
    },
  },
  required: ['catalogId', 'name', 'rawValue', 'matchType'],
  additionalProperties: false,
} as const;

const BASE_EXPENSE_PROPERTIES = {
  title: { type: 'string', maxLength: 100 },
  amount: { type: ['number', 'null'] },
  occurredAtMillis: { type: ['integer', 'null'] },
  currency: CURRENCY_MATCH_SCHEMA,
  category: CATALOG_MATCH_SCHEMA,
  paymentMethod: CATALOG_MATCH_SCHEMA,
  store: { type: ['string', 'null'], maxLength: 100 },
  sourceText: { type: 'string', maxLength: 180 },
  confidence: { type: 'number', minimum: 0, maximum: 1 },
  requiresReview: { type: 'boolean' },
  reviewReasons: {
    type: 'array',
    maxItems: 5,
    items: { type: 'string', maxLength: 60 },
  },
} as const;

const BASE_EXPENSE_REQUIRED = [
  'title',
  'amount',
  'occurredAtMillis',
  'currency',
  'category',
  'paymentMethod',
  'store',
  'sourceText',
  'confidence',
  'requiresReview',
  'reviewReasons',
] as const;

/**
 * Voice/text extraction: no photo, no OCR, so there is nothing to cross-check a
 * field against — `fieldEvidence` and `lineItems` are receipt-only concepts and
 * were never read by this path (see `AiService.extractExpenses`, which returns
 * the model's JSON untouched). A previous "fix recibo" commit bolted the full
 * receipt schema onto this path too, which both served fields no client reads
 * and, combined with a `maxItems` raised beyond 1, pushed Gemini's structured
 * output past what it can constrain-decode ("schema produces a constraint that
 * has too many states for serving"). Keeping this schema lean fixes both.
 */
const EXPENSE_ITEM_SCHEMA = {
  type: 'object',
  properties: BASE_EXPENSE_PROPERTIES,
  required: BASE_EXPENSE_REQUIRED,
  additionalProperties: false,
} as const;

/** Receipt-photo extraction: itemized lines and per-field OCR evidence only make sense here. */
const RECEIPT_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    ...BASE_EXPENSE_PROPERTIES,
    lineItems: {
      type: 'array',
      maxItems: 20,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 80 },
          amountMajor: { type: ['number', 'null'] },
        },
        required: ['name', 'amountMajor'],
        additionalProperties: false,
      },
    },
    fieldEvidence: {
      type: 'object',
      properties: {
        title: RECEIPT_FIELD_EVIDENCE_SCHEMA,
        store: RECEIPT_FIELD_EVIDENCE_SCHEMA,
        amount: RECEIPT_FIELD_EVIDENCE_SCHEMA,
        currency: RECEIPT_FIELD_EVIDENCE_SCHEMA,
        occurredAtMillis: RECEIPT_FIELD_EVIDENCE_SCHEMA,
        paymentMethod: RECEIPT_FIELD_EVIDENCE_SCHEMA,
      },
      required: [
        'title',
        'store',
        'amount',
        'currency',
        'occurredAtMillis',
        'paymentMethod',
      ],
      additionalProperties: false,
    },
  },
  required: [...BASE_EXPENSE_REQUIRED, 'lineItems', 'fieldEvidence'],
  additionalProperties: false,
} as const;

/**
 * Voice/text extraction: a single spoken or typed sentence can describe several
 * expenses ("gasté 20 en el bus y 15 en el almuerzo"), so the array is left open
 * (capped at a sane upper bound, not 1) — capping this at maxItems: 1 previously
 * made it impossible for the model to ever return more than one expense. The cap
 * is kept modest (not, say, 20) because Gemini's structured-output mode rejects
 * schemas outright with "too many states for serving" once a nested array's
 * length limit gets too large for its item schema's complexity — 8 covers any
 * realistic single sentence while staying well inside that budget.
 */
export const EXPENSE_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    expenses: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: EXPENSE_ITEM_SCHEMA,
    },
  },
  required: ['expenses'],
  additionalProperties: false,
} as const;

/** Receipt-photo extraction: one photo is always exactly one expense. */
export const RECEIPT_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    expenses: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      items: RECEIPT_ITEM_SCHEMA,
    },
  },
  required: ['expenses'],
  additionalProperties: false,
} as const;

export const LEAK_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    leakScore: { type: 'integer' },
    leakSummary: { type: 'string' },
    detectedLeaks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          explanation: { type: 'string' },
          savingTip: { type: 'string' },
          frequency: { type: 'string' },
          aggregateAmount: { type: 'number' },
          currencyCode: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          associatedTransactionIds: {
            type: 'array',
            items: { type: 'integer' },
          },
        },
        required: [
          'title',
          'explanation',
          'savingTip',
          'frequency',
          'aggregateAmount',
          'currencyCode',
          'severity',
          'associatedTransactionIds',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['leakScore', 'leakSummary', 'detectedLeaks'],
  additionalProperties: false,
} as const;

export const MONTHLY_REPORT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    reportSummary: { type: 'string' },
    monthComparisonSummary: { type: 'string' },
    spendingChangePercent: { type: 'integer' },
    topLeaks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          amountMajor: { type: 'number' },
          currencyCode: { type: 'string' },
          explanation: { type: 'string' },
          suggestedAction: { type: 'string' },
        },
        required: [
          'title',
          'amountMajor',
          'currencyCode',
          'explanation',
          'suggestedAction',
        ],
        additionalProperties: false,
      },
    },
    budgetRecommendation: {
      type: 'object',
      properties: {
        categoryName: { type: 'string' },
        suggestedLimitMajor: { type: 'number' },
        currencyCode: { type: 'string' },
        rationale: { type: 'string' },
        createBudgetPrompt: { type: 'string' },
      },
      required: [
        'categoryName',
        'suggestedLimitMajor',
        'currencyCode',
        'rationale',
        'createBudgetPrompt',
      ],
      additionalProperties: false,
    },
    highlights: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'reportSummary',
    'monthComparisonSummary',
    'spendingChangePercent',
    'topLeaks',
    'budgetRecommendation',
    'highlights',
  ],
  additionalProperties: false,
} as const;
