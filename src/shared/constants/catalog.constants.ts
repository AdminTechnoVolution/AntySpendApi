export const CURRENCY_SEED = [
  { code: 'USD', minorUnits: 2, displayLabel: 'US Dollar' },
  { code: 'EUR', minorUnits: 2, displayLabel: 'Euro' },
  { code: 'GBP', minorUnits: 2, displayLabel: 'British Pound' },
  { code: 'BRL', minorUnits: 2, displayLabel: 'Brazilian Real' },
  { code: 'MXN', minorUnits: 2, displayLabel: 'Mexican Peso' },
  { code: 'COP', minorUnits: 2, displayLabel: 'Colombian Peso' },
  { code: 'JPY', minorUnits: 0, displayLabel: 'Japanese Yen' },
  { code: 'CAD', minorUnits: 2, displayLabel: 'Canadian Dollar' },
  { code: 'CHF', minorUnits: 2, displayLabel: 'Swiss Franc' },
  { code: 'AUD', minorUnits: 2, displayLabel: 'Australian Dollar' },
] as const;

export const PAYMENT_METHOD_CATALOG = [
  {
    id: 'pm_cash',
    name: 'Cash',
    aliases: ['efectivo', 'cash', 'plata', 'billete', 'monedas', 'mano'],
  },
  {
    id: 'pm_debit_card',
    name: 'Debit Card',
    aliases: ['debito', 'tarjeta debito', 'debit'],
  },
  {
    id: 'pm_credit_card',
    name: 'Credit Card',
    aliases: ['credito', 'tarjeta credito', 'credit', 'visa', 'mastercard'],
  },
  {
    id: 'pm_bank_transfer',
    name: 'Bank Transfer',
    aliases: ['transferencia', 'banco', 'pse', 'nequi', 'daviplata', 'wire'],
  },
  {
    id: 'pm_digital_wallet',
    name: 'Digital Wallet',
    aliases: ['billetera digital', 'apple pay', 'google pay', 'paypal'],
  },
  {
    id: 'pm_other',
    name: 'Other',
    aliases: ['otro metodo', 'otros'],
  },
] as const;
