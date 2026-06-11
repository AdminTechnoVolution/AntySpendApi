export const EXPENSE_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    expenses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          amount: { type: ['number', 'null'] },
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
          store: { type: ['string', 'null'] },
          sourceText: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          requiresReview: { type: 'boolean' },
          reviewReasons: { type: 'array', items: { type: 'string' } },
        },
        required: [
          'title',
          'amount',
          'currency',
          'category',
          'paymentMethod',
          'store',
          'sourceText',
          'confidence',
          'requiresReview',
          'reviewReasons',
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
