import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryChallan, useDeliveryChallanItems } from '@/hooks/useDeliveryChallans';
import { DC_TYPE_LABELS, PURPOSE_LABELS, JOB_WORK_DIRECTION_LABELS } from '@/types/deliveryChallan';

export default function PrintDeliveryChallan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: dc, isLoading: dcLoading } = useDeliveryChallan(id || '');
  const { data: items = [], isLoading: itemsLoading } = useDeliveryChallanItems(id || '');

  const handlePrint = () => {
    if (dc) {
      // Set document title for the PDF filename
      const dcDate = format(new Date(dc.dc_date), 'dd-MM-yyyy');
      const dcType = dc.dc_type.toUpperCase().replace(/_/g, '-');
      const direction = (dc.job_work_direction || 'given').toUpperCase();
      const originalTitle = document.title;
      document.title = `Delivery-Challan_${direction}_${dcType}_FF_${dc.dc_number}_${dcDate}`;
      
      window.print();
      
      // Restore original title after print dialog
      setTimeout(() => {
        document.title = originalTitle;
      }, 100);
    } else {
      window.print();
    }
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

  const direction = dc.job_work_direction || 'given';
  const isJobWorkTaken = direction === 'taken';
  
  // Get purposes to display
  const displayPurposes = dc.purposes && dc.purposes.length > 0 
    ? dc.purposes.map(p => PURPOSE_LABELS[p as keyof typeof PURPOSE_LABELS] || p).join(', ')
    : PURPOSE_LABELS[dc.purpose] || dc.purpose;

  // Dynamic labels based on direction
  const headerTitle = isJobWorkTaken 
    ? 'DELIVERY CHALLAN - JOB WORK RETURN'
    : 'DELIVERY CHALLAN - JOB WORK OUTWARD';
  
  const consigneeLabel = isJobWorkTaken ? 'Principal Company (Return To):' : 'Consignee (Job Worker):';
  
  const declarationText = isJobWorkTaken
    ? 'Goods returned after job work completion. These goods were received from the Principal Company for processing and are being returned after completion of work.'
    : 'Goods sent for job work only. Not for sale. Ownership remains with M/s Feather Fashions. These goods are being sent for processing/job work and will be returned after completion of work.';

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
        <div className="print-content p-6 print:p-4">
          {/* Header - Compact */}
          <div className="border-b-2 border-primary pb-3 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-primary">FEATHER FASHIONS</h1>
                <p className="text-xs text-muted-foreground">Premium Sportswear Manufacturing</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                  251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti, Tiruppur, Tamil Nadu 641602<br />
                  Phone: +91 9789225510 | Email: hello@featherfashions.in | Web: featherfashions.in
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold border-2 border-primary px-3 py-1.5">
                  {headerTitle}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {DC_TYPE_LABELS[dc.dc_type]}
                </p>
                <p className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded inline-block ${
                  isJobWorkTaken ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {JOB_WORK_DIRECTION_LABELS[direction]}
                </p>
              </div>
            </div>
          </div>

          {/* DC Info Grid - Compact */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">DC Number:</span>
                <span className="font-bold text-xs">{dc.dc_number}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">DC Date:</span>
                <span className="font-medium text-xs">{format(new Date(dc.dc_date), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">Purpose:</span>
                <span className="font-medium capitalize text-xs">{displayPurposes}</span>
              </div>
              {dc.expected_return_date && (
                <div className="flex">
                  <span className="w-28 text-muted-foreground text-xs">Expected Return:</span>
                  <span className="font-medium text-xs">{format(new Date(dc.expected_return_date), 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">Vehicle No:</span>
                <span className="font-bold font-mono text-xs">{dc.vehicle_number}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">Driver Name:</span>
                <span className="font-medium text-xs">{dc.driver_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-muted-foreground text-xs">Driver Mobile:</span>
                <span className="font-mono text-xs">{dc.driver_mobile}</span>
              </div>
            </div>
          </div>

          {/* Job Worker / Principal Company Details - Compact */}
          <div className="border rounded p-3 mb-4 bg-muted/20 print:bg-gray-50">
            <h3 className="font-semibold text-xs mb-1">{consigneeLabel}</h3>
            <p className="font-bold text-sm">{dc.job_worker_name}</p>
            {dc.job_worker_address && (
              <p className="text-xs text-muted-foreground">{dc.job_worker_address}</p>
            )}
            {dc.job_worker_gstin && (
              <p className="text-xs">
                <span className="text-muted-foreground">GSTIN: </span>
                <span className="font-mono">{dc.job_worker_gstin}</span>
              </p>
            )}
          </div>

          {/* Items Table - Compact */}
          <table className="w-full border-collapse border mb-4 print-table text-xs">
            <thead>
              <tr className="bg-muted/50 print:bg-gray-100">
                <th className="border px-2 py-1.5 text-left w-10">S.No</th>
                <th className="border px-2 py-1.5 text-left">Product / Fabric Name</th>
                <th className="border px-2 py-1.5 text-left w-20">SKU</th>
                <th className="border px-2 py-1.5 text-left w-14">Size</th>
                <th className="border px-2 py-1.5 text-left w-16">Color</th>
                <th className="border px-2 py-1.5 text-right w-16">Qty</th>
                <th className="border px-2 py-1.5 text-center w-14">UOM</th>
                <th className="border px-2 py-1.5 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1.5 text-center">{index + 1}</td>
                  <td className="border px-2 py-1.5 font-medium">{item.product_name}</td>
                  <td className="border px-2 py-1.5 font-mono">{item.sku || '-'}</td>
                  <td className="border px-2 py-1.5">{item.size || '-'}</td>
                  <td className="border px-2 py-1.5">{item.color || '-'}</td>
                  <td className="border px-2 py-1.5 text-right font-semibold">{item.quantity}</td>
                  <td className="border px-2 py-1.5 text-center uppercase">{item.uom}</td>
                  <td className="border px-2 py-1.5">{item.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Quantity - Compact */}
          <div className="total-quantity-section mb-4 flex justify-end">
            <div className="border-2 border-gray-300 px-4 py-1.5 bg-gray-50 print:bg-gray-100">
              <span className="font-semibold text-gray-600 text-xs">Total Quantity: </span>
              <span className="font-bold text-sm">{dc.total_quantity}</span>
            </div>
          </div>

          {/* Notes - Compact */}
          {dc.notes && (
            <div className="mb-4">
              <h4 className="font-semibold text-xs mb-1">Notes:</h4>
              <p className="text-xs border rounded p-2 bg-muted/10">{dc.notes}</p>
            </div>
          )}

          {/* Declaration - Compact */}
          <div className="border rounded p-2 mb-6 print-declaration" style={{ backgroundColor: '#fef3c7' }}>
            <p className="text-xs">
              <strong>Declaration:</strong> {declarationText}
            </p>
          </div>

          {/* Signatures Section - Professional */}
          <div className="print-signatures">
            <div className="grid grid-cols-4 gap-3 pt-4 border-t-2 border-gray-300">
              <div className="text-center">
                <div className="h-12 border-b-2 border-dashed border-gray-400 mb-1 flex items-end justify-center pb-1">
                  <span className="text-xs font-bold tracking-wide">SIVASUBRAMANIAN VADIVEL</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">Prepared By</p>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-dashed border-gray-400 mb-1"></div>
                <p className="text-xs font-semibold text-gray-700">Checked By</p>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-dashed border-gray-400 mb-1"></div>
                <p className="text-xs font-semibold text-gray-700">Driver Signature</p>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-dashed border-gray-400 mb-1"></div>
                <p className="text-xs font-semibold text-gray-700">{isJobWorkTaken ? 'Received By (Company)' : 'Received By'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Remove browser headers/footers and URL */
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 20mm 10mm;
          }

          .print-table tbody tr td {
            padding: 4px 6px;
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
