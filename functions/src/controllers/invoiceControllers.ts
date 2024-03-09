// import axios from "axios";
import fs from "fs/promises";
import path from "path";

interface Invoice {
  line_items: Items[];
  currency: string;
  customer: customer;
  payment_method: string;
  status: string;
  notes: string;
  created_at: string;
  accountId: string;
}

interface Items {
  name: string;
  description: string;
  price: string;
  qty: number;
  taxe_rate: number;
  tax_included: boolean;
  tax_factor: string;
  tax_withholding: boolean;
  tax_type: string;
  category: string;
  sku: string;
  product_key: string;
  unit_code: string;
  unit_key: string;
  unit_name: string;
}

type customer = {
  name: string;
  email: string;
  phone: string;
  address: address;
};

type address = {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

// Obtener facturas JSON

export const getInvoicesData = async (): Promise<[]> => {
  try {
    const jsonPath = path.join(__dirname, "../../data/payments.json");
    const response = await fs.readFile(jsonPath, "utf-8");
    const data = JSON.parse(response);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Cambiar moneda de Items a MXN
export const exchangeCurrency = async () => {
  const mxnInvoices: Invoice[] = [];
  const usdInvoices: Invoice[] = [];
  const URL =
    "https://v6.exchangerate-api.com/v6/7e1acdc490b73639f04080b3/pair/USD/MXN";
  try {
    // obtener todas las facturas
    const invoicesData = await getInvoicesData();
    // separa facturas en mxn y usd
    invoicesData.forEach((invoice: Invoice) => {
      if (invoice.currency === "mxn") {
        mxnInvoices.push(invoice);
      } else if (invoice.currency === "usd") {
        usdInvoices.push(invoice);
      }
    });
    const fetchExchange = await fetch(URL);
    const exchangeData = await fetchExchange.json();
    const conversionRate = await exchangeData.conversion_rate;
    // convierte facturas usd a mxn
    const usdToMxnInvoices = usdInvoices.map((invoice) => {
      const exchange = invoice.line_items.map((item) => {
        const price = Number(item.price);
        const priceToMxn = (price * conversionRate).toFixed(2);
        const priceToString = priceToMxn.toString();
        return {...item, price: priceToString};
      });
      return {...invoice, currency: "mxn", line_items: exchange};
    });
    // une todas las facturas en un solo array
    const allInvoices = [...mxnInvoices, ...usdToMxnInvoices];
    return allInvoices;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//

export const createInvoices = async () => {
  const invoicesByAccount: { [key: string]: Invoice[] } = {};
  try {
    const invoices = await exchangeCurrency();

    invoices.forEach((invoice) => {
      const accountId = invoice.accountId;
      if (!invoicesByAccount[accountId]) {
        invoicesByAccount[accountId] = [];
      }
      invoicesByAccount[accountId].push(invoice);
    });
    return invoicesByAccount;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
