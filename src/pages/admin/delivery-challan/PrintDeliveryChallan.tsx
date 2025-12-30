import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryChallan, useDeliveryChallanItems } from '@/hooks/useDeliveryChallans';
import { DC_TYPE_LABELS } from '@/types/deliveryChallan';

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
        <p className="text-sm text-muted-foreground print:hidden">
          Tip: Disable <b>Headers & Footers</b> in print settings for a clean Delivery Challan.
        </p>

        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print DC
        </Button>
      </div>

      {/* Printable Content */}
      <div
        ref={printRef}
        className="print-container bg-white mx-auto max-w-[210mm] print:max-w-none print:m-0 shadow-lg print:shadow-none"
      >
        {/* Main Content Area */}
        <div className="print-content p-8 print:p-6">
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
          <div className="border rounded-lg p-4 mb-6 bg-muted/20 print:bg-gray-50">
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
          <table className="w-full border-collapse border mb-6 print-table">
            <thead>
              <tr className="bg-muted/50 print:bg-gray-100">
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
          </table>

          {/* Total Quantity - Only shown once at the end, not on every page */}
          <div className="total-quantity-section mb-6 flex justify-end">
            <div className="border-2 border-gray-300 px-6 py-2 bg-gray-50 print:bg-gray-100">
              <span className="font-semibold text-gray-600">Total Quantity: </span>
              <span className="font-bold text-lg">{dc.total_quantity}</span>
            </div>
          </div>

          {/* Notes */}
          {dc.notes && (
            <div className="mb-6">
              <h4 className="font-semibold mb-1">Notes:</h4>
              <p className="text-sm border rounded p-2 bg-muted/10">{dc.notes}</p>
            </div>
          )}

          {/* Declaration */}
          <div className="border rounded-lg p-3 mb-8 print-declaration" style={{ backgroundColor: '#fef3c7' }}>
            <p className="text-sm">
              <strong>Declaration:</strong> Goods sent for job work only. Not for sale.
              Ownership remains with M/s Feather Fashions. These goods are being sent for
              processing/job work and will be returned after completion of work.
            </p>
          </div>

          {/* Signatures Section */}
          <div className="print-signatures">
            <div className="grid grid-cols-4 gap-4 pt-6 border-t-2 border-gray-300">
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Prepared By</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Checked By</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Driver Signature</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b-2 border-dashed border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">Received By</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Branded Footer - Fixed at bottom of each printed page */}
        {/* <div className="print-branded-footer hidden print:block">
          <div className="branded-footer-content">
            <div className="footer-line"></div>
            <div className="footer-main">
              <span className="brand-name">FEATHER FASHIONS</span>
              <span className="brand-separator">|</span>
              <span className="brand-tagline">Effortless Comfort. Perfect Form.</span>
            </div>
            <div className="footer-contact">
              <span>www.featherfashions.in</span>
              <span className="footer-dot">•</span>
              <span>hello@featherfashions.in</span>
              <span className="footer-dot">•</span>
              <span>+91 9789225510</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Remove browser headers/footers and URL */
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 32mm 12mm;
          }

          .print-table tbody tr td {
            padding: 6px 8px;
            vertical-align: top;
          }

          .print-table tbody tr:last-child {
            page-break-inside: avoid;
          }


          
          /* Hide admin dashboard and screen elements */
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Table styling */
          .print-table {
            page-break-inside: auto;
          }
          
          .print-table thead {
            display: table-header-group;
          }
          
          .print-table tbody tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Total quantity section - keep with content, not on every page */
          .total-quantity-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Declaration section */
          .print-declaration {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Signatures - ensure they appear at the end and stay together */
          .print-signatures {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 20px;
          }
          
          /* Clean Branded Footer - appears at bottom of every page */
          .print-branded-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 18mm;
            display: block !important;
            visibility: visible !important;
            background: white;
          }
          
          .branded-footer-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 4px 16px;
          }
          
          .footer-line {
            width: 100%;
            height: 1px;
            background: #e5e7eb;
            margin-bottom: 6px;
          }
          
          .footer-main {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 2px;
          }
          
          .brand-name {
            font-size: 12px;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: 1.5px;
          }
          
          .brand-separator {
            color: #d1d5db;
            font-size: 12px;
          }
          
          .brand-tagline {
            font-size: 10px;
            color: #6b7280;
            font-style: italic;
          }
          
          .footer-contact {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 9px;
            color: #9ca3af;
          }
          
          .footer-dot {
            color: #d1d5db;
          }
        }
        
        /* Screen preview of footer */
        @media screen {
          .print-branded-footer {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
