import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';

const bulkOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  productInterest: z.string().min(1, 'Product interest is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const BulkOrder = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    productInterest: '',
    quantity: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      bulkOrderSchema.parse({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        productInterest: formData.productInterest,
        quantity: parseInt(formData.quantity),
      });

      const { error } = await supabase.from('bulk_order_requests').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName || null,
          product_interest: formData.productInterest,
          quantity: parseInt(formData.quantity),
          requirements: formData.requirements || null,
        },
      ]);

      if (error) throw error;

      toast.success('Bulk order request submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        productInterest: '',
        quantity: '',
        requirements: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bulk & Wholesale Orders</h1>
          <p className="text-muted-foreground text-lg">
            Request a quote for bulk orders and wholesale partnerships
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Request</CardTitle>
            <CardDescription>
              Fill out the form below and our team will get back to you with a customized quote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productInterest">Product Interest *</Label>
                  <Input
                    id="productInterest"
                    name="productInterest"
                    placeholder="e.g., Women's Lounge Sets"
                    value={formData.productInterest}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  placeholder="Tell us about any specific requirements, customizations, or questions..."
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkOrder;
