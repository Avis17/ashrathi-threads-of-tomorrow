import { forwardRef } from 'react';
import { CompanyProfileInput, StitchingMachine, MeasurementTools } from '@/hooks/useCompanyProfile';
import { format } from 'date-fns';
import logoImage from '@/assets/logo.png';
import {
  Building2,
  Scissors,
  Settings2,
  CheckCircle2,
  Flame,
  Zap,
  Package,
  Users,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCheck,
  X,
} from 'lucide-react';

interface CompanyProfilePreviewProps {
  data: CompanyProfileInput;
}

const CompanyProfilePreview = forwardRef<HTMLDivElement, CompanyProfilePreviewProps>(
  ({ data }, ref) => {
    const totalMachines = (data.stitching_machines || []).reduce((sum, m) => sum + (m.count || 0), 0);
    const currentDate = format(new Date(), 'dd MMM yyyy');

    const YesNo = ({ value }: { value: boolean | null | undefined }) => (
      value ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCheck className="h-4 w-4" /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <X className="h-4 w-4" /> No
        </span>
      )
    );

    return (
      <div ref={ref} className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoImage} alt="Feather Fashions" className="h-16 w-16 object-contain bg-white rounded-lg p-1" />
            </div>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold tracking-wide">FEATHER FASHIONS GARMENTS</h1>
              <p className="text-amber-400 text-sm mt-1 font-medium">Company Infrastructure Profile</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-stone-400">Date</p>
              <p className="font-medium">{currentDate}</p>
              {data.company_code && (
                <>
                  <p className="text-stone-400 mt-2">Code</p>
                  <p className="font-medium">{data.company_code}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Company Details */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Building2 className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Company Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Company Name</p>
                <p className="font-semibold">{data.company_name || '-'}</p>
              </div>
              <div>
                <p className="text-stone-500">Brand Name</p>
                <p className="font-semibold">{data.brand_name || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-stone-500">Address</p>
                <p className="font-medium">
                  {[data.address, data.city, data.state, data.country].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Contact Person</p>
                <p className="font-medium">{data.contact_person || '-'}</p>
              </div>
              <div>
                <p className="text-stone-500">Phone</p>
                <p className="font-medium">{data.phone || '-'}</p>
              </div>
              <div>
                <p className="text-stone-500">Email</p>
                <p className="font-medium">{data.email || '-'}</p>
              </div>
              <div>
                <p className="text-stone-500">Website</p>
                <p className="font-medium">{data.website || '-'}</p>
              </div>
              {data.gst_number && (
                <div>
                  <p className="text-stone-500">GST Number</p>
                  <p className="font-medium">{data.gst_number}</p>
                </div>
              )}
            </div>
          </section>

          {/* Cutting Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Scissors className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Cutting Section</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Cutting Tables</p>
                <p className="font-semibold text-lg">{data.cutting_tables_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Table Size</p>
                <p className="font-medium">{data.cutting_table_size || '-'}</p>
              </div>
              <div>
                <p className="text-stone-500">Fabric Inspection Tables</p>
                <p className="font-semibold text-lg">{data.fabric_inspection_tables_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Inspection Table Size</p>
                <p className="font-medium">{data.fabric_inspection_table_size || '-'}</p>
              </div>
            </div>
            {data.cutting_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.cutting_notes}</p>
              </div>
            )}
          </section>

          {/* Stitching Machines Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Settings2 className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Stitching Machines</h2>
              <span className="ml-auto bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                Total: {totalMachines}
              </span>
            </div>
            {(data.stitching_machines || []).length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="text-left p-2 font-semibold">Machine Type</th>
                    <th className="text-center p-2 font-semibold">Count</th>
                    <th className="text-left p-2 font-semibold">Brand</th>
                    <th className="text-left p-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.stitching_machines || []).map((machine: StitchingMachine, idx: number) => (
                    <tr key={machine.id || idx} className="border-b">
                      <td className="p-2">{machine.type || '-'}</td>
                      <td className="p-2 text-center font-semibold">{machine.count}</td>
                      <td className="p-2">{machine.brand || '-'}</td>
                      <td className="p-2 text-stone-500">{machine.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-stone-500 text-sm">No machines listed</p>
            )}
            {data.stitching_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.stitching_notes}</p>
              </div>
            )}
          </section>

          {/* Checking/Quality Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Checking / Quality Section</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Checking Tables</p>
                <p className="font-semibold text-lg">{data.checking_tables_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Table Size</p>
                <p className="font-medium">{data.checking_table_size || '-'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-stone-500 text-sm mb-2">Measurement Tools</p>
              <div className="flex flex-wrap gap-2">
                {(data.measurement_tools as MeasurementTools)?.tape && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Measuring Tape</span>
                )}
                {(data.measurement_tools as MeasurementTools)?.gsm_cutter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">GSM Cutter</span>
                )}
                {(data.measurement_tools as MeasurementTools)?.shade_card && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Shade Card</span>
                )}
                {(data.measurement_tools as MeasurementTools)?.needle_detector && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Needle Detector</span>
                )}
              </div>
            </div>
            {data.checking_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.checking_notes}</p>
              </div>
            )}
          </section>

          {/* Ironing Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Flame className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Ironing / Finishing Section</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Ironing Tables</p>
                <p className="font-semibold text-lg">{data.ironing_tables_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Steam Irons</p>
                <p className="font-semibold text-lg">{data.steam_iron_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Vacuum Table</p>
                <p className="font-medium"><YesNo value={data.vacuum_table_available} /></p>
              </div>
              <div>
                <p className="text-stone-500">Boiler</p>
                <p className="font-medium"><YesNo value={data.boiler_available} /></p>
              </div>
            </div>
            {data.ironing_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.ironing_notes}</p>
              </div>
            )}
          </section>

          {/* Utilities Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Zap className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Utilities & Power Backup</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Generator</p>
                <p className="font-medium">
                  <YesNo value={data.generator_available} />
                  {data.generator_available && data.generator_capacity && (
                    <span className="ml-2 text-stone-600">({data.generator_capacity})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Compressor</p>
                <p className="font-medium">
                  <YesNo value={data.compressor_available} />
                  {data.compressor_available && data.compressor_capacity && (
                    <span className="ml-2 text-stone-600">({data.compressor_capacity})</span>
                  )}
                </p>
              </div>
              {data.power_connection_type && (
                <div className="col-span-2">
                  <p className="text-stone-500">Power Connection</p>
                  <p className="font-medium">{data.power_connection_type}</p>
                </div>
              )}
            </div>
            {data.utilities_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.utilities_notes}</p>
              </div>
            )}
          </section>

          {/* Packing Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Package className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Packing Section</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Packing Tables</p>
                <p className="font-semibold text-lg">{data.packing_tables_count || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Polybag Sealing Machine</p>
                <p className="font-medium"><YesNo value={data.polybag_sealing_available} /></p>
              </div>
              <div>
                <p className="text-stone-500">Tagging/Barcode Support</p>
                <p className="font-medium"><YesNo value={data.tagging_barcode_support} /></p>
              </div>
              <div>
                <p className="text-stone-500">Storage Racks</p>
                <p className="font-medium"><YesNo value={data.storage_racks_available} /></p>
              </div>
            </div>
            {data.packing_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.packing_notes}</p>
              </div>
            )}
          </section>

          {/* Staff & Capacity Section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
              <Users className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">Staff & Capacity</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="col-span-3 bg-amber-50 p-3 rounded-lg">
                <p className="text-stone-500">Total Employees</p>
                <p className="font-bold text-2xl text-amber-800">{data.total_employees || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Cutting Staff</p>
                <p className="font-semibold">{data.cutting_staff || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Stitching Staff</p>
                <p className="font-semibold">{data.stitching_staff || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Checking Staff</p>
                <p className="font-semibold">{data.checking_staff || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Ironing Staff</p>
                <p className="font-semibold">{data.ironing_staff || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Packing Staff</p>
                <p className="font-semibold">{data.packing_staff || 0}</p>
              </div>
              <div>
                <p className="text-stone-500">Daily Capacity</p>
                <p className="font-semibold">{data.daily_production_capacity || '-'}</p>
              </div>
            </div>
            {data.staff_notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600">{data.staff_notes}</p>
              </div>
            )}
          </section>

          {/* General Remarks */}
          {data.general_remarks && (
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-500">
                <h2 className="text-lg font-bold text-stone-800">General Remarks</h2>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg text-sm">
                <p className="text-stone-600 whitespace-pre-wrap">{data.general_remarks}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 border-t p-4 mt-8">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <div>
              <p className="font-medium text-stone-700">Generated by Feather Fashions Dashboard</p>
              <p>+91 9988322555 | hello@featherfashions.in | www.featherfashions.in</p>
            </div>
            <div className="text-right">
              <p>Page 1</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CompanyProfilePreview.displayName = 'CompanyProfilePreview';

export default CompanyProfilePreview;
