import { forwardRef } from 'react';
import { CompanyProfile } from './useProfileData';
import { Building2, Scissors, Shirt, CheckCircle, Flame, Package, Users, Phone, Mail, MapPin, Globe, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { StitchingMachine } from './StitchingMachinesInput';

interface ProfilePreviewProps {
  profile: Partial<CompanyProfile>;
}

export const ProfilePreview = forwardRef<HTMLDivElement, ProfilePreviewProps>(
  ({ profile }, ref) => {
    const totalTables = (profile.cutting_tables_count || 0) + (profile.checking_tables_count || 0) + 
                        (profile.ironing_tables_count || 0) + (profile.packing_tables_count || 0) +
                        (profile.fabric_inspection_tables_count || 0);
    
    const totalStaff = (profile.cutting_staff || 0) + (profile.stitching_staff || 0) + 
                       (profile.checking_staff || 0) + (profile.ironing_staff || 0) + (profile.packing_staff || 0);

    // Smart badge content selection with fallback hierarchy
    const getBadgeContent = () => {
      if (profile.company_code) return profile.company_code;
      if (profile.gst_number) return `GST: ${profile.gst_number.slice(-6)}`;
      if (profile.daily_production_capacity) return profile.daily_production_capacity;
      if (profile.total_employees) return `${profile.total_employees} Staff`;
      return null;
    };

    const badgeContent = getBadgeContent();

    return (
      <div ref={ref} className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto shadow-2xl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{profile.company_name || 'Company Name'}</h1>
              {profile.brand_name && <p className="text-amber-400 text-lg font-medium mt-1">{profile.brand_name}</p>}
              <p className="text-slate-400 text-sm mt-2">Infrastructure & Capability Profile</p>
            </div>
            <div className="text-right">
              {badgeContent && (
                <div className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm">
                  {badgeContent}
                </div>
              )}
              <p className="text-slate-400 text-xs mt-2">{format(new Date(), 'dd MMM yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="bg-slate-100 px-8 py-4 flex flex-wrap gap-6 text-sm text-slate-700 border-b-2 border-amber-500">
          {profile.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-amber-600" />{profile.phone}</div>}
          {profile.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-amber-600" />{profile.email}</div>}
          {profile.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-amber-600" />{profile.website}</div>}
          {profile.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-600" />{profile.city}, {profile.state}</div>}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 p-8 bg-gradient-to-b from-slate-50 to-white">
          <StatCard icon={<Users className="h-6 w-6" />} label="Total Staff" value={profile.total_employees || totalStaff} color="blue" />
          <StatCard icon={<Scissors className="h-6 w-6" />} label="Total Tables" value={totalTables} color="green" />
          <StatCard icon={<Zap className="h-6 w-6" />} label="Power" value={profile.power_connection_type || 'N/A'} color="amber" />
          <StatCard icon={<Building2 className="h-6 w-6" />} label="Capacity" value={profile.daily_production_capacity || 'N/A'} color="purple" />
        </div>

        {/* Sections Grid */}
        <div className="p-8 space-y-6">
          {/* Utilities Row */}
          <div className="grid grid-cols-3 gap-4">
            <FeatureCard title="Generator" available={profile.generator_available} detail={profile.generator_capacity} />
            <FeatureCard title="Compressor" available={profile.compressor_available} detail={profile.compressor_capacity} />
            <FeatureCard title="Boiler" available={profile.boiler_available} />
          </div>

          {/* Cutting Section */}
          <SectionCard
            icon={<Scissors className="h-5 w-5" />}
            title="Cutting Section"
            color="emerald"
            items={[
              { label: 'Cutting Tables', value: `${profile.cutting_tables_count || 0} (${profile.cutting_table_size || 'N/A'})` },
              { label: 'Fabric Inspection Tables', value: `${profile.fabric_inspection_tables_count || 0}` },
              { label: 'Staff', value: profile.cutting_staff || 0 },
            ]}
            notes={profile.cutting_notes}
          />

          {/* Stitching Section */}
          <StitchingSectionCard profile={profile} />

          {/* Checking Section */}
          <SectionCard
            icon={<CheckCircle className="h-5 w-5" />}
            title="Checking Section"
            color="violet"
            items={[
              { label: 'Checking Tables', value: `${profile.checking_tables_count || 0} (${profile.checking_table_size || 'N/A'})` },
              { label: 'Staff', value: profile.checking_staff || 0 },
            ]}
            notes={profile.checking_notes}
          />

          {/* Ironing Section */}
          <SectionCard
            icon={<Flame className="h-5 w-5" />}
            title="Ironing Section"
            color="orange"
            items={[
              { label: 'Ironing Tables', value: profile.ironing_tables_count || 0 },
              { label: 'Steam Irons', value: profile.steam_iron_count || 0 },
              { label: 'Vacuum Table', value: profile.vacuum_table_available ? 'Yes' : 'No' },
              { label: 'Staff', value: profile.ironing_staff || 0 },
            ]}
            notes={profile.ironing_notes}
          />

          {/* Packing Section */}
          <SectionCard
            icon={<Package className="h-5 w-5" />}
            title="Packing Section"
            color="teal"
            items={[
              { label: 'Packing Tables', value: profile.packing_tables_count || 0 },
              { label: 'Storage Racks', value: profile.storage_racks_available ? 'Yes' : 'No' },
              { label: 'Polybag Sealing', value: profile.polybag_sealing_available ? 'Yes' : 'No' },
              { label: 'Tagging/Barcode', value: profile.tagging_barcode_support ? 'Yes' : 'No' },
              { label: 'Staff', value: profile.packing_staff || 0 },
            ]}
            notes={profile.packing_notes}
          />

          {/* General Remarks */}
          {profile.general_remarks && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">General Remarks</h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{profile.general_remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 text-center py-4 mt-auto">
          <p className="text-slate-400 text-xs">Generated by Feather Fashions • {format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
      </div>
    );
  }
);

ProfilePreview.displayName = 'ProfilePreview';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`rounded-xl p-4 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const FeatureCard = ({ title, available, detail }: { title: string; available?: boolean | null; detail?: string | null }) => (
  <div className={`rounded-lg p-4 text-center border ${available ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
    <p className={`font-semibold ${available ? 'text-green-700' : 'text-slate-500'}`}>{title}</p>
    <p className={`text-sm ${available ? 'text-green-600' : 'text-slate-400'}`}>
      {available ? (detail || 'Available') : 'Not Available'}
    </p>
  </div>
);

const StitchingSectionCard = ({ profile }: { profile: Partial<CompanyProfile> }) => {
  // Parse stitching_machines from JSON
  const machines: StitchingMachine[] = profile.stitching_machines 
    ? (typeof profile.stitching_machines === 'string' 
        ? JSON.parse(profile.stitching_machines) 
        : profile.stitching_machines as unknown as StitchingMachine[])
    : [];

  const totalMachines = machines.reduce((sum, m) => sum + (m.count || 0), 0);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex items-center gap-2">
        <Shirt className="h-5 w-5" />
        <h3 className="font-semibold">Stitching Section</h3>
      </div>
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Staff</p>
            <p className="font-semibold text-slate-800">{profile.stitching_staff || 0}</p>
          </div>
          {totalMachines > 0 && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Total: {totalMachines} Machines
            </div>
          )}
        </div>
        
        {machines.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Stitching Machines Available:</p>
            <ul className="space-y-1">
              {machines.map((machine, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="font-medium text-slate-700">
                    {machine.type === 'Others' ? machine.customType : machine.type}
                  </span>
                  <span className="text-slate-500">- {machine.count} Nos</span>
                  {machine.brand && (
                    <span className="text-slate-400 text-xs">({machine.brand})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {profile.stitching_notes && (
          <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{profile.stitching_notes}</p>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ icon, title, color, items, notes }: { 
  icon: React.ReactNode; 
  title: string; 
  color: string;
  items: { label: string; value: string | number }[];
  notes?: string | null;
}) => {
  const headerColors: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    violet: 'from-violet-500 to-violet-600',
    orange: 'from-orange-500 to-orange-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className={`bg-gradient-to-r ${headerColors[color]} text-white px-4 py-3 flex items-center gap-2`}>
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <div key={idx}>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{item.label}</p>
              <p className="font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
        {notes && <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{notes}</p>}
      </div>
    </div>
  );
};
