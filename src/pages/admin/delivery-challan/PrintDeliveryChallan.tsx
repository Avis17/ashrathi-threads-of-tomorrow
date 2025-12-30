import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryChallan, useDeliveryChallanItems } from '@/hooks/useDeliveryChallans';
import { DC_TYPE_LABELS, PURPOSE_LABELS } from '@/types/deliveryChallan';

export default function PrintDeliveryChallan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: dc, isLoading: dcLoading } = useDeliveryChallan(id || '');
  const { data: items = [], isLoading: itemsLoading } = useDeliveryChallanItems(id || '');

  const handlePrint = () => {
    window.print();
  };

  if (dcLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold">Delivery Challan Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/admin/delivery-challan')} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Screen Controls - Hidden on Print */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Print Preview</h1>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print DC
        </Button>
      </div>

      {/* Printable Content */}
      <div 
        ref={printRef}
        className="bg-white mx-auto max-w-[210mm] print:max-w-none print:m-0 shadow-lg print:shadow-none"
        style={{ minHeight: '297mm' }}
      >
        <div className="p-8 print:p-6">
          {/* Header */}
          <div className="border-b-2 border-primary pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-primary">FEATHER FASHIONS</h1>
                <p className="text-sm text-muted-foreground mt-1">Premium Sportswear Manufacturing</p>
                <p className="text-xs text-muted-foreground mt-2">
                  251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti, Tiruppur, Tamil Nadu 641602<br />
                  Phone: +91 9789225510 | Email: hello@featherfashions.in<br />
                  Website: featherfashions.in
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold border-2 border-primary px-4 py-2">
                  DELIVERY CHALLAN
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {DC_TYPE_LABELS[dc.dc_type]}
                </p>
              </div>
            </div>
          </div>

          {/* DC Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-muted-foreground">DC Number:</span>
                <span className="font-bold">{dc.dc_number}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-muted-foreground">DC Date:</span>
                <span className="font-medium">{format(new Date(dc.dc_date), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-muted-foreground">Purpose:</span>
                <span className="font-medium capitalize">{dc.purpose}</span>
              </div>
              {dc.expected_return_date && (
                <div className="flex">
                  <span className="w-32 text-muted-foreground">Expected Return:</span>
                  <span className="font-medium">{format(new Date(dc.expected_return_date), 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-muted-foreground">Vehicle No:</span>
                <span className="font-bold font-mono">{dc.vehicle_number}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-muted-foreground">Driver Name:</span>
                <span className="font-medium">{dc.driver_name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-muted-foreground">Driver Mobile:</span>
                <span className="font-mono">{dc.driver_mobile}</span>
              </div>
            </div>
          </div>

          {/* Job Worker Details */}
          <div className="border rounded-lg p-4 mb-6 bg-muted/20">
            <h3 className="font-semibold mb-2">Consignee (Job Worker):</h3>
            <p className="font-bold text-lg">{dc.job_worker_name}</p>
            {dc.job_worker_address && (
              <p className="text-sm text-muted-foreground mt-1">{dc.job_worker_address}</p>
            )}
            {dc.job_worker_gstin && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">GSTIN: </span>
                <span className="font-mono">{dc.job_worker_gstin}</span>
              </p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border mb-6">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-left w-12">S.No</th>
                <th className="border p-2 text-left">Product / Fabric Name</th>
                <th className="border p-2 text-left w-24">SKU</th>
                <th className="border p-2 text-left w-16">Size</th>
                <th className="border p-2 text-left w-20">Color</th>
                <th className="border p-2 text-right w-20">Qty</th>
                <th className="border p-2 text-center w-16">UOM</th>
                <th className="border p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 font-medium">{item.product_name}</td>
                  <td className="border p-2 font-mono text-sm">{item.sku || '-'}</td>
                  <td className="border p-2">{item.size || '-'}</td>
                  <td className="border p-2">{item.color || '-'}</td>
                  <td className="border p-2 text-right font-semibold">{item.quantity}</td>
                  <td className="border p-2 text-center uppercase">{item.uom}</td>
                  <td className="border p-2 text-sm">{item.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-semibold">
                <td colSpan={5} className="border p-2 text-right">Total Quantity:</td>
                <td className="border p-2 text-right text-lg">{dc.total_quantity}</td>
                <td colSpan={2} className="border p-2"></td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          {dc.notes && (
            <div className="mb-6">
              <h4 className="font-semibold mb-1">Notes:</h4>
              <p className="text-sm border rounded p-2 bg-muted/10">{dc.notes}</p>
            </div>
          )}

          {/* Declaration */}
          <div className="border rounded-lg p-3 bg-amber-50 mb-8">
            <p className="text-sm">
              <strong>Declaration:</strong> Goods sent for job work only. Not for sale. 
              Ownership remains with M/s Feather Fashions. These goods are being sent for 
              processing/job work and will be returned after completion of work.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-4 pt-8 border-t">
            <div className="text-center">
              <div className="border-b border-dashed mb-2 pb-12"></div>
              <p className="text-sm font-medium">Prepared By</p>
            </div>
            <div className="text-center">
              <div className="border-b border-dashed mb-2 pb-12"></div>
              <p className="text-sm font-medium">Checked By</p>
            </div>
            <div className="text-center">
              <div className="border-b border-dashed mb-2 pb-12"></div>
              <p className="text-sm font-medium">Driver Signature</p>
            </div>
            <div className="text-center">
              <div className="border-b border-dashed mb-2 pb-12"></div>
              <p className="text-sm font-medium">Received By</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>This is a computer-generated document. Page 1 of 1</p>
            <p className="mt-1">Printed on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
