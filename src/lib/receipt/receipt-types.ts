export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type ReceiptTransaction = {
  description: string;
  amount: number;
  category_id: string;
};

export type ReceiptResult = {
  store: string | null;
  transaction_date: string | null;
  transactions: ReceiptTransaction[];
  categories: Category[];
};

export type Transaction = {
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
};

export type AiResult = {
  transactions?: Transaction[];
  categories?: Category[];
  error?: string;
};
