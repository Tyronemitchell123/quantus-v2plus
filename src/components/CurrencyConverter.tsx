import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = [
  { code: "USD", symbol: "$", rate: 1, label: "USD ($)" },
  { code: "EUR", symbol: "€", rate: 0.92, label: "EUR (€)" },
  { code: "GBP", symbol: "£", rate: 0.79, label: "GBP (£)" },
  { code: "JPY", symbol: "¥", rate: 149.5, label: "JPY (¥)" },
  { code: "CAD", symbol: "CA$", rate: 1.36, label: "CAD (CA$)" },
  { code: "AUD", symbol: "A$", rate: 1.53, label: "AUD (A$)" },
  { code: "CHF", symbol: "CHF", rate: 0.88, label: "CHF" },
  { code: "INR", symbol: "₹", rate: 83.1, label: "INR (₹)" },
];

export type Currency = (typeof currencies)[number];

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const convert = (usdAmount: number) => {
    if (usdAmount === 0) return 0;
    return Math.round(usdAmount * currency.rate);
  };

  const formatPrice = (usdAmount: number) => {
    if (usdAmount === 0) return "Custom";
    const converted = convert(usdAmount);
    if (currency.code === "JPY") {
      return `${currency.symbol}${converted.toLocaleString()}`;
    }
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return { currency, setCurrency, currencies, convert, formatPrice };
};

interface CurrencyConverterProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencies: Currency[];
}

const CurrencyConverter = ({ currency, setCurrency, currencies: currencyList }: CurrencyConverterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <Globe size={14} className="text-muted-foreground" />
      <Select
        value={currency.code}
        onValueChange={(code) => {
          const found = currencyList.find((c) => c.code === code);
          if (found) setCurrency(found);
        }}
      >
        <SelectTrigger className="w-[120px] h-8 text-xs bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencyList.map((c) => (
            <SelectItem key={c.code} value={c.code} className="text-xs">
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currency.code !== "USD" && (
        <AnimatePresence>
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            Approximate rates
          </motion.span>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default CurrencyConverter;
