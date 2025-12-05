import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Package, Search, Edit } from 'lucide-react';
import { ProductData } from '@/pages/admin/LabelGenerator';
import { useProducts } from '@/hooks/useProducts';

interface ProductDataStepProps {
  data: ProductData;
  onDataChange: (data: ProductData, sizes?: string[], colors?: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProductDataStep = ({ data, onDataChange, onNext, onBack }: ProductDataStepProps) => {
  const { data: products, isLoading } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [manualMode, setManualMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products?.find(p => p.id === productId);
    if (product) {
      const sizes = product.available_sizes || [];
      const colors = product.available_colors?.map(c => c.name) || [];
      
      onDataChange({
        productName: product.name,
        size: sizes[0] || '',
        color: colors[0] || '',
        material: product.fabric || '',
        mrp: product.price?.toString() || '',
        barcodeValue: generateGTIN(), // Generate a sample GTIN
      }, sizes, colors);
    }
  };

  const generateGTIN = () => {
    // Generate a sample EAN-13 barcode (12 digits + check digit)
    const prefix = '890'; // Sample prefix
    const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const digits = prefix + random;
    
    // Calculate check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return digits + checkDigit;
  };

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            Product Data
          </CardTitle>
          <CardDescription>Select a product or enter data manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <Button
              variant={!manualMode ? 'default' : 'ghost'}
              className={!manualMode ? 'flex-1' : 'flex-1 hover:bg-slate-200'}
              onClick={() => setManualMode(false)}
            >
              <Search className="h-4 w-4 mr-2" />
              Select from Products
            </Button>
            <Button
              variant={manualMode ? 'default' : 'ghost'}
              className={manualMode ? 'flex-1' : 'flex-1 hover:bg-slate-200'}
              onClick={() => setManualMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {!manualMode ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                ) : (
                  filteredProducts.slice(0, 12).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProductId === product.id
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Data Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Product Name</Label>
              <Input
                value={data.productName}
                onChange={(e) => onDataChange({ ...data, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              {selectedProduct && !manualMode ? (
                <Select
                  value={data.size}
                  onValueChange={(value) => onDataChange({ ...data, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.available_sizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={data.size}
                  onChange={(e) => onDataChange({ ...data, size: e.target.value })}
                  placeholder="e.g., M, L, XL"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              {selectedProduct && !manualMode ? (
                <Select
                  value={data.color}
                  onValueChange={(value) => onDataChange({ ...data, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.available_colors.map((color) => (
                      <SelectItem key={color.name} value={color.name}>{color.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={data.color}
                  onChange={(e) => onDataChange({ ...data, color: e.target.value })}
                  placeholder="e.g., Black, Navy"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Material / Fabric</Label>
              <Input
                value={data.material}
                onChange={(e) => onDataChange({ ...data, material: e.target.value })}
                placeholder="e.g., 100% Cotton"
              />
            </div>
            <div className="space-y-2">
              <Label>MRP (₹)</Label>
              <Input
                value={data.mrp}
                onChange={(e) => onDataChange({ ...data, mrp: e.target.value })}
                placeholder="e.g., 599"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Barcode Value (GTIN/EAN-13)</Label>
              <div className="flex gap-2">
                <Input
                  value={data.barcodeValue}
                  onChange={(e) => onDataChange({ ...data, barcodeValue: e.target.value })}
                  placeholder="13-digit barcode"
                  maxLength={13}
                />
                <Button
                  variant="outline"
                  onClick={() => onDataChange({ ...data, barcodeValue: generateGTIN() })}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={onNext}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              size="lg"
              disabled={!data.productName || !data.barcodeValue}
            >
              Continue to Designer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <CardDescription>Information to be included on label</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Product', value: data.productName },
              { label: 'Size', value: data.size },
              { label: 'Color', value: data.color },
              { label: 'Material', value: data.material },
              { label: 'MRP', value: data.mrp ? `₹${data.mrp}` : '' },
              { label: 'Barcode', value: data.barcodeValue },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {item.value || '—'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
