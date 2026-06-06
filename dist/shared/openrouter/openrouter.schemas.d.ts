export declare const EXPENSE_EXTRACTION_JSON_SCHEMA: {
    readonly type: "object";
    readonly properties: {
        readonly expenses: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly amount: {
                        readonly type: readonly ["number", "null"];
                    };
                    readonly currency: {
                        readonly type: "object";
                        readonly properties: {
                            readonly catalogId: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly code: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly name: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly rawValue: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly matchType: {
                                readonly type: "string";
                                readonly enum: readonly ["EXACT_MATCH", "SEMANTIC_MATCH", "DEFAULT_VALUE", "UNMATCHED", "NOT_PROVIDED"];
                            };
                        };
                        readonly required: readonly ["catalogId", "code", "name", "rawValue", "matchType"];
                        readonly additionalProperties: false;
                    };
                    readonly category: {
                        readonly type: "object";
                        readonly properties: {
                            readonly catalogId: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly name: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly rawValue: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly matchType: {
                                readonly type: "string";
                                readonly enum: readonly ["EXACT_MATCH", "SEMANTIC_MATCH", "UNMATCHED", "NOT_PROVIDED"];
                            };
                        };
                        readonly required: readonly ["catalogId", "name", "rawValue", "matchType"];
                        readonly additionalProperties: false;
                    };
                    readonly paymentMethod: {
                        readonly type: "object";
                        readonly properties: {
                            readonly catalogId: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly name: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly rawValue: {
                                readonly type: readonly ["string", "null"];
                            };
                            readonly matchType: {
                                readonly type: "string";
                                readonly enum: readonly ["EXACT_MATCH", "SEMANTIC_MATCH", "UNMATCHED", "NOT_PROVIDED"];
                            };
                        };
                        readonly required: readonly ["catalogId", "name", "rawValue", "matchType"];
                        readonly additionalProperties: false;
                    };
                    readonly store: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly sourceText: {
                        readonly type: "string";
                    };
                    readonly confidence: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly maximum: 1;
                    };
                    readonly requiresReview: {
                        readonly type: "boolean";
                    };
                    readonly reviewReasons: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
                readonly required: readonly ["title", "amount", "currency", "category", "paymentMethod", "store", "sourceText", "confidence", "requiresReview", "reviewReasons"];
                readonly additionalProperties: false;
            };
        };
    };
    readonly required: readonly ["expenses"];
    readonly additionalProperties: false;
};
export declare const LEAK_ANALYSIS_JSON_SCHEMA: {
    readonly type: "object";
    readonly properties: {
        readonly leakScore: {
            readonly type: "integer";
        };
        readonly leakSummary: {
            readonly type: "string";
        };
        readonly detectedLeaks: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly explanation: {
                        readonly type: "string";
                    };
                    readonly savingTip: {
                        readonly type: "string";
                    };
                    readonly frequency: {
                        readonly type: "string";
                    };
                    readonly aggregateAmount: {
                        readonly type: "number";
                    };
                    readonly currencyCode: {
                        readonly type: "string";
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: readonly ["HIGH", "MEDIUM", "LOW"];
                    };
                    readonly associatedTransactionIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                        };
                    };
                };
                readonly required: readonly ["title", "explanation", "savingTip", "frequency", "aggregateAmount", "currencyCode", "severity", "associatedTransactionIds"];
                readonly additionalProperties: false;
            };
        };
    };
    readonly required: readonly ["leakScore", "leakSummary", "detectedLeaks"];
    readonly additionalProperties: false;
};
