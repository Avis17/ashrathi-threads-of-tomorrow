import { useRef } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ProductionPlan } from '@/hooks/useDCDocuments';

interface Props {
  plan: ProductionPlan;
  onBack: () => void;
}

export default function ProductionPlanPreview({ plan, onBack }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Production-Plan_${plan.pgm_no || 'draft'}.pdf`);
  };

  const handlePrint = () => window.print();
  const fmtDate = (d: string | null) => {
    if (!d) return '';
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  const Check = ({ checked }: { checked: boolean }) => (
    <span className={`inline-block w-3.5 h-3.5 border border-gray-600 rounded-sm text-center leading-[14px] text-[9px] ${checked ? 'bg-green-100' : ''}`}>
      {checked ? '✓' : ''}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back to Edit</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Print</Button>
          <Button onClick={handleDownload}><Download className="h-4 w-4 mr-1" />Download PDF</Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={printRef}
          className="bg-white text-black shadow-lg"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '12mm 15mm',
            fontFamily: "'Inter', Arial, sans-serif",
            fontSize: '10.5px',
            lineHeight: '1.35',
          }}
        >
          {/* Header */}
          <div className="text-center mb-3">
            <h1 className="text-base font-bold tracking-wide">FEATHER FASHIONS</h1>
            <h2 className="text-sm font-semibold border-b-2 border-black pb-1 inline-block mt-0.5">PRE PLAN DETAILS</h2>
          </div>

          {/* Top info row */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1"></div>
            <div className="border border-gray-500 px-3 py-1 text-[10px]">
              <span className="font-bold">PGM. NO.: </span>{plan.pgm_no || '—'}
              <span className="ml-4 font-bold">DATE: </span>{fmtDate(plan.plan_date)}
            </div>
          </div>

          {/* Main table */}
          <table className="w-full border-collapse text-[10px]" style={{ border: '1px solid #666' }}>
            <tbody>
              {/* Basic Info Section */}
              <Row label="FOLLOW UP BY" value={plan.follow_up_by} />
              <Row label="SUPPLIER" value={plan.supplier} />
              <Row label="IC NO." value={plan.ic_no} />
              <Row label="ITEM NAME" value={plan.item_name} />
              <Row label="SIZE" value={plan.sizes} />
              <Row label="SIDE CUT STYLE" value={plan.side_cut_style} />

              {/* Fabric Details */}
              <tr>
                <td colSpan={2} className="border border-gray-500 px-2 py-1 text-center font-bold bg-gray-50">FABRIC DETAILS</td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-gray-500 px-2 py-2 whitespace-pre-wrap" style={{ minHeight: '50px' }}>
                  {plan.fabric_details || ''}
                </td>
              </tr>

              {/* Details / Approvals combined */}
              <tr>
                <td className="border border-gray-500 w-1/2 align-top p-0">
                  <table className="w-full border-collapse text-[10px]">
                    <tbody>
                      <CheckRow label="ORIGINAL PATTERN" checked={plan.original_pattern} />
                      <CheckRow label="TRACED PATTERN" checked={plan.traced_pattern} />
                      <CheckRow label="ORIGINAL SAMPLE" checked={plan.original_sample} />
                      <CheckRow label="1ST SAMPLE APPROVAL" checked={plan.first_sample_approval} />
                      <CheckRow label="MAIN LABEL" checked={plan.main_label} />
                      <CheckRow label="CARE LABEL" checked={plan.care_label} />
                      <CheckRow label="FUSING STICKER" checked={plan.fusing_sticker} />
                      <CheckRow label="FLAG LABEL" checked={plan.flag_label} />
                      <CheckRow label="ROPE" checked={plan.rope} />
                      <CheckRow label="BUTTON" checked={plan.button} />
                      <CheckRow label="METAL BADGES" checked={plan.metal_badges} />
                      <CheckRow label="ZIPPERS" checked={plan.zippers} />
                      <CheckRow label="FOLLOW UP PERSON" value={plan.follow_up_person} />
                      <CheckRow label="QC" value={plan.qc_person} />
                      <CheckRow label="OTHERS" value={plan.others_detail} />
                    </tbody>
                  </table>
                </td>
                <td className="border border-gray-500 w-1/2 align-top p-0">
                  <table className="w-full border-collapse text-[10px]">
                    <tbody>
                      <tr><td colSpan={2} className="border-b border-gray-400 px-2 py-1 text-center font-bold bg-gray-50">POST PRODUCTION DETAILS</td></tr>
                      <ValueRow label="PRINT" value={plan.print_detail} />
                      <ValueRow label="EMBROIDERY" value={plan.embroidery_detail} />
                      <ValueRow label="STONE" value={plan.stone_detail} />
                      <ValueRow label="FUSING" value={plan.fusing_detail} />
                      <ValueRow label="COIN" value={plan.coin_detail} />
                      <ValueRow label="OTHERS" value={plan.others_post_production} />
                      <tr><td colSpan={2} className="border-b border-gray-400 px-2 py-1 text-center font-bold bg-gray-50">PACKING METHOD APPROVALS</td></tr>
                      <ValueRow label="PACKING TYPE" value={plan.packing_type} />
                      <CheckRow label="POLY BAG" checked={plan.poly_bag} />
                      <CheckRow label="ATTA" checked={plan.atta} />
                      <CheckRow label="PHOTO" checked={plan.photo} />
                      <CheckRow label="TAG" checked={plan.tag} />
                      <CheckRow label="BOX" checked={plan.box} />
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Authorization */}
              <tr>
                <td className="border border-gray-500 px-2 py-3 text-center text-[9px]">
                  <p className="font-bold mb-4">AUTHORISED SIGN - 1</p>
                  <p className="mt-2">{plan.authorised_sign_1 || ''}</p>
                </td>
                <td className="border border-gray-500 px-2 py-3 text-center text-[9px]">
                  <p className="font-bold mb-4">AUTHORISED SIGN - 2</p>
                  <p className="mt-2">{plan.authorised_sign_2 || ''}</p>
                </td>
              </tr>

              {/* Special Instructions */}
              <tr>
                <td colSpan={2} className="border border-gray-500 px-2 py-1 text-center font-bold bg-gray-50">SPECIAL INSTRUCTIONS</td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-gray-500 px-2 py-2 whitespace-pre-wrap" style={{ minHeight: '40px' }}>
                  {plan.special_instructions || ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <tr>
      <td className="border border-gray-500 px-2 py-1 font-semibold w-[35%] bg-gray-50">{label}</td>
      <td className="border border-gray-500 px-2 py-1">{value || ''}</td>
    </tr>
  );
}

function CheckRow({ label, checked, value }: { label: string; checked?: boolean; value?: string | null }) {
  return (
    <tr>
      <td className="border-b border-gray-400 px-2 py-1 font-semibold">{label}</td>
      <td className="border-b border-gray-400 px-2 py-1">
        {value !== undefined ? (value || '') : (
          <span className={`inline-block w-3.5 h-3.5 border border-gray-600 rounded-sm text-center leading-[14px] text-[9px] ${checked ? 'bg-green-100' : ''}`}>
            {checked ? '✓' : ''}
          </span>
        )}
      </td>
    </tr>
  );
}

function ValueRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <tr>
      <td className="border-b border-gray-400 px-2 py-1 font-semibold">{label}</td>
      <td className="border-b border-gray-400 px-2 py-1">{value || ''}</td>
    </tr>
  );
}
