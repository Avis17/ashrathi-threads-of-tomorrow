import { CMTQuotationData } from '@/types/cmt-quotation';

interface CMTQuotationPreviewProps {
  data: CMTQuotationData;
}

export const CMTQuotationPreview = ({ data }: CMTQuotationPreviewProps) => {
  const totalStitchingCost = data.operations.reduce((sum, op) => sum + op.ratePerPiece, 0);
  const finalCMTPerPiece = totalStitchingCost + data.finishingPackingCost + data.overheadsCost;
  const totalOrderValue = finalCMTPerPiece * data.orderQuantity;

  return (
    <div
      className="bg-white text-[#1a1a1a] w-[794px] min-h-[1123px] mx-auto shadow-lg relative"
      style={{ fontFamily: "'Inter', 'Source Sans Pro', sans-serif" }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] overflow-hidden">
        <span className="text-[200px] font-bold tracking-widest rotate-[-30deg] text-[#1a1a1a] whitespace-nowrap">
          FEATHER FASHIONS
        </span>
      </div>

        <div className="relative p-10">
          {/* Header */}
          <header className="flex justify-between items-start pb-6 border-b-2 border-[#e5e5e5]">
            <div>
              <div className="w-16 h-16 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-[#374151]">FF</span>
              </div>
              <h1 className="text-2xl font-bold tracking-wide uppercase text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', 'Libre Baskerville', serif" }}>
                Feather Fashions
              </h1>
              <p className="text-sm text-[#6b7280] mt-0.5">Garment Manufacturing Unit</p>
              <p className="text-xs text-[#9ca3af] mt-2 max-w-[280px]">
                251/1, Vadivel Nagar, Thottipalayam,<br />
                Pooluvapatti, Tiruppur, Tamil Nadu 641602, India
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">
                GST: 33FWTPS1281P1ZJ | Ph: +91 9789225510 | hello@featherfashions.in
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-[#374151] uppercase tracking-wider mb-4">CMT Quotation</h2>
              <div className="space-y-1 text-sm">
                <p><span className="text-[#6b7280]">Quotation No:</span> <span className="font-medium">{data.quotationNo || 'CMT-2025-001'}</span></p>
                <p><span className="text-[#6b7280]">Date:</span> <span className="font-medium">{data.date || new Date().toLocaleDateString('en-IN')}</span></p>
                <p><span className="text-[#6b7280]">Valid Until:</span> <span className="font-medium">{data.validUntil || '-'}</span></p>
              </div>
            </div>
          </header>

          {/* Buyer & Style Details */}
          <section className="grid grid-cols-2 gap-8 py-6 border-b border-[#e5e5e5]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Buyer Details</h3>
              <p className="font-semibold text-[#1a1a1a]">{data.buyerName || 'Buyer Name'}</p>
              <div className="text-sm text-[#6b7280] mt-2 space-y-1">
                {(data.contactPersonName || data.contactPersonPhone) && (
                  <p>
                    <span className="text-[#9ca3af]">Contact:</span>{' '}
                    <span>{data.contactPersonName || '-'}</span>
                    {data.contactPersonPhone && <span> | {data.contactPersonPhone}</span>}
                  </p>
                )}
                <p>
                  <span className="text-[#9ca3af]">Address:</span>{' '}
                  <span className="whitespace-pre-line">{data.buyerAddress || '-'}</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Style Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <p><span className="text-[#6b7280]">Style:</span> <span className="font-medium">{data.styleName || '-'}</span></p>
                <p><span className="text-[#6b7280]">Code:</span> <span className="font-medium">{data.styleCode || '-'}</span></p>
                <p><span className="text-[#6b7280]">Fabric:</span> <span className="font-medium">{data.fabricType || '-'} {data.gsm ? `(${data.gsm} GSM)` : ''}</span></p>
                <p><span className="text-[#6b7280]">Fit:</span> <span className="font-medium">{data.fitType || '-'}</span></p>
                <p><span className="text-[#6b7280]">Size Range:</span> <span className="font-medium">{data.sizeRange || '-'}</span></p>
                <p><span className="text-[#6b7280]">Quantity:</span> <span className="font-medium">{data.orderQuantity > 0 ? `${data.orderQuantity.toLocaleString()} pcs` : '-'}</span></p>
              </div>
            </div>
          </section>

          {/* Operations Table */}
          <section className="py-6 border-b border-[#e5e5e5]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-4">Operations Breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left py-2 font-semibold text-[#374151]">Category</th>
                  <th className="text-left py-2 font-semibold text-[#374151]">Machine</th>
                  <th className="text-left py-2 font-semibold text-[#374151]">Description</th>
                  <th className="text-right py-2 font-semibold text-[#374151]">SMV</th>
                  <th className="text-right py-2 font-semibold text-[#374151]">Rate/Pc</th>
                </tr>
              </thead>
              <tbody>
                {data.operations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-[#9ca3af] italic">No operations added</td>
                  </tr>
                ) : (
                  data.operations.map((op, idx) => (
                    <tr key={op.id} className={idx % 2 === 0 ? 'bg-[#fafafa]' : ''}>
                      <td className="py-2 text-[#374151]">{op.category}</td>
                      <td className="py-2 text-[#6b7280]">{op.machineType}</td>
                      <td className="py-2 text-[#374151]">{op.description || '-'}</td>
                      <td className="py-2 text-right text-[#6b7280]">{op.smv.toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">Rs. {op.ratePerPiece.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.operations.length > 0 && (
                <tfoot>
                  <tr className="border-t border-[#e5e5e5]">
                    <td colSpan={3} className="py-2 text-right font-semibold text-[#374151]">Total</td>
                    <td className="py-2 text-right font-semibold">{data.operations.reduce((sum, op) => sum + op.smv, 0).toFixed(2)}</td>
                    <td className="py-2 text-right font-bold">Rs. {totalStitchingCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </section>

          {/* Trims Section */}
          {data.trims.length > 0 && (
            <section className="py-6 border-b border-[#e5e5e5]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-4">Trims & Accessories</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="text-left py-2 font-semibold text-[#374151]">Item</th>
                    <th className="text-left py-2 font-semibold text-[#374151]">Provided By</th>
                    <th className="text-left py-2 font-semibold text-[#374151]">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trims.map((trim, idx) => (
                    <tr key={trim.id} className={idx % 2 === 0 ? 'bg-[#fafafa]' : ''}>
                      <td className="py-2 text-[#374151]">{trim.trimName || '-'}</td>
                      <td className="py-2 text-[#6b7280]">{trim.providedBy}</td>
                      <td className="py-2 text-[#6b7280]">{trim.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Cost Summary */}
          <section className="py-6 border-b border-[#e5e5e5]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-4">Cost Summary</h3>
            <div className="bg-[#f9fafb] rounded-lg p-5 border border-[#e5e5e5]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Total Operations Cost</span>
                  <span className="font-medium">Rs. {totalStitchingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Finishing & Packing</span>
                  <span className="font-medium">Rs. {data.finishingPackingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Overheads</span>
                  <span className="font-medium">Rs. {data.overheadsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Order Quantity</span>
                  <span className="font-medium">{data.orderQuantity > 0 ? `${data.orderQuantity.toLocaleString()} pcs` : '-'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex justify-center">
                <div className="bg-[#1a1a1a] text-white rounded-lg p-4 text-center min-w-[180px]">
                  <p className="text-xs uppercase tracking-wider opacity-80">Final CMT / Piece</p>
                  <p className="text-2xl font-bold mt-1">Rs. {finalCMTPerPiece.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer / Signature */}
          <footer className="pt-8 flex justify-between items-end">
            <div className="text-xs text-[#9ca3af]">
              <p>This is a computer generated quotation.</p>
              <p>For any queries, please contact us.</p>
            </div>
            <div className="text-center">
              <div className="w-40 h-16 border-b border-[#d1d5db] mb-2"></div>
              <p className="text-sm font-semibold text-[#374151]">{data.signatoryName || 'Authorized Signatory'}</p>
              <p className="text-xs text-[#6b7280]">Feather Fashions</p>
            </div>
        </footer>
      </div>
    </div>
  );
};
