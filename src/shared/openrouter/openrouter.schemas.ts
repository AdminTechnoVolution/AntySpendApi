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

export const EXPENSE_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    expenses: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 100 },
          amount: { type: ['number', 'null'] },
          occurredAtMillis: { type: ['integer', 'null'] },
          currency: {
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
          },
          category: {
            type: 'object',
            properties: {
              catalogId: { type: ['string', 'null'] },
              name: { type: ['string', 'null'] },
              rawValue: { type: ['string', 'null'] },
              matchType: {
                type: 'string',
                enum: [
                  'EXACT_MATCH',
                  'SEMANTIC_MATCH',
                  'UNMATCHED',
                  'NOT_PROVIDED',
                ],
              },
            },
            required: ['catalogId', 'name', 'rawValue', 'matchType'],
            additionalProperties: false,
          },
          paymentMethod: {
            type: 'object',
            properties: {
              catalogId: { type: ['string', 'null'] },
              name: { type: ['string', 'null'] },
              rawValue: { type: ['string', 'null'] },
              matchType: {
                type: 'string',
                enum: [
                  'EXACT_MATCH',
                  'SEMANTIC_MATCH',
                  'UNMATCHED',
                  'NOT_PROVIDED',
                ],
              },
            },
            required: ['catalogId', 'name', 'rawValue', 'matchType'],
            additionalProperties: false,
          },
          store: { type: ['string', 'null'], maxLength: 100 },
          sourceText: { type: 'string', maxLength: 180 },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          requiresReview: { type: 'boolean' },
          reviewReasons: {
            type: 'array',
            maxItems: 5,
            items: { type: 'string', maxLength: 60 },
          },
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
        required: [
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
          'lineItems',
          'fieldEvidence',
        ],
        additionalProperties: false,
      },
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
