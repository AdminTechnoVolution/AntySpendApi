export declare const CURRENCY_SEED: readonly [{
    readonly code: "USD";
    readonly minorUnits: 2;
    readonly displayLabel: "US Dollar";
}, {
    readonly code: "EUR";
    readonly minorUnits: 2;
    readonly displayLabel: "Euro";
}, {
    readonly code: "GBP";
    readonly minorUnits: 2;
    readonly displayLabel: "British Pound";
}, {
    readonly code: "BRL";
    readonly minorUnits: 2;
    readonly displayLabel: "Brazilian Real";
}, {
    readonly code: "MXN";
    readonly minorUnits: 2;
    readonly displayLabel: "Mexican Peso";
}, {
    readonly code: "COP";
    readonly minorUnits: 2;
    readonly displayLabel: "Colombian Peso";
}, {
    readonly code: "JPY";
    readonly minorUnits: 0;
    readonly displayLabel: "Japanese Yen";
}, {
    readonly code: "CAD";
    readonly minorUnits: 2;
    readonly displayLabel: "Canadian Dollar";
}, {
    readonly code: "CHF";
    readonly minorUnits: 2;
    readonly displayLabel: "Swiss Franc";
}, {
    readonly code: "AUD";
    readonly minorUnits: 2;
    readonly displayLabel: "Australian Dollar";
}];
export declare const PAYMENT_METHOD_CATALOG: readonly [{
    readonly id: "pm_cash";
    readonly name: "Cash";
    readonly aliases: readonly ["efectivo", "cash", "plata", "billete", "monedas", "mano"];
}, {
    readonly id: "pm_debit_card";
    readonly name: "Debit Card";
    readonly aliases: readonly ["debito", "tarjeta debito", "debit"];
}, {
    readonly id: "pm_credit_card";
    readonly name: "Credit Card";
    readonly aliases: readonly ["credito", "tarjeta credito", "credit", "visa", "mastercard"];
}, {
    readonly id: "pm_bank_transfer";
    readonly name: "Bank Transfer";
    readonly aliases: readonly ["transferencia", "banco", "pse", "nequi", "daviplata", "wire"];
}, {
    readonly id: "pm_digital_wallet";
    readonly name: "Digital Wallet";
    readonly aliases: readonly ["billetera digital", "apple pay", "google pay", "paypal"];
}, {
    readonly id: "pm_other";
    readonly name: "Other";
    readonly aliases: readonly ["otro metodo", "otros"];
}];
