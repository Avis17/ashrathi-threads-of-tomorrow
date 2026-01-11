import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

const CurrencyConverter = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError(t('currency.invalidAmount'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );
      const data = await response.json();

      if (data.success && data.result) {
        const convertedAmount = data.result.toFixed(2);
        const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
        setResult(`${toCurrencyData?.symbol || ''}${convertedAmount} ${toCurrency}`);
      } else {
        // Fallback to approximate rates if API fails
        const fallbackRates: Record<string, Record<string, number>> = {
          INR: { USD: 0.012, AED: 0.044, SAR: 0.045, EUR: 0.011, GBP: 0.0095, INR: 1 },
          USD: { INR: 83.5, AED: 3.67, SAR: 3.75, EUR: 0.92, GBP: 0.79, USD: 1 },
          AED: { INR: 22.7, USD: 0.27, SAR: 1.02, EUR: 0.25, GBP: 0.22, AED: 1 },
          SAR: { INR: 22.3, USD: 0.27, AED: 0.98, EUR: 0.25, GBP: 0.21, SAR: 1 },
          EUR: { INR: 90.5, USD: 1.09, AED: 4.0, SAR: 4.08, GBP: 0.86, EUR: 1 },
          GBP: { INR: 105.5, USD: 1.27, AED: 4.65, SAR: 4.75, EUR: 1.16, GBP: 1 },
        };
        
        const rate = fallbackRates[fromCurrency]?.[toCurrency] || 1;
        const convertedAmount = (Number(amount) * rate).toFixed(2);
        const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
        setResult(`${toCurrencyData?.symbol || ''}${convertedAmount} ${toCurrency}`);
      }
    } catch (err) {
      // Use fallback rates on error
      const fallbackRates: Record<string, Record<string, number>> = {
        INR: { USD: 0.012, AED: 0.044, SAR: 0.045, EUR: 0.011, GBP: 0.0095, INR: 1 },
        USD: { INR: 83.5, AED: 3.67, SAR: 3.75, EUR: 0.92, GBP: 0.79, USD: 1 },
        AED: { INR: 22.7, USD: 0.27, SAR: 1.02, EUR: 0.25, GBP: 0.22, AED: 1 },
        SAR: { INR: 22.3, USD: 0.27, AED: 0.98, EUR: 0.25, GBP: 0.21, SAR: 1 },
        EUR: { INR: 90.5, USD: 1.09, AED: 4.0, SAR: 4.08, GBP: 0.86, EUR: 1 },
        GBP: { INR: 105.5, USD: 1.27, AED: 4.65, SAR: 4.75, EUR: 1.16, GBP: 1 },
      };
      
      const rate = fallbackRates[fromCurrency]?.[toCurrency] || 1;
      const convertedAmount = (Number(amount) * rate).toFixed(2);
      const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
      setResult(`${toCurrencyData?.symbol || ''}${convertedAmount} ${toCurrency}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-4 uppercase">
        {t('currency.exportTools')}
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-primary-foreground/60 mb-1 block">
            {t('currency.amount')}
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-9 text-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-primary-foreground/60 mb-1 block">
              {t('currency.from')}
            </label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary border-primary-foreground/20">
                {CURRENCIES.map((currency) => (
                  <SelectItem 
                    key={currency.code} 
                    value={currency.code}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {currency.code} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-primary-foreground/60 mb-1 block">
              {t('currency.to')}
            </label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary border-primary-foreground/20">
                {CURRENCIES.map((currency) => (
                  <SelectItem 
                    key={currency.code} 
                    value={currency.code}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {currency.code} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handleConvert}
          disabled={loading}
          size="sm"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-9"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            t('currency.convert')
          )}
        </Button>
        
        {result && (
          <div className="p-2 bg-primary-foreground/10 rounded text-center">
            <span className="text-sm font-medium text-primary-foreground">{result}</span>
          </div>
        )}
        
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        
        <p className="text-[10px] text-primary-foreground/40 leading-relaxed">
          {t('currency.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
