import { forwardRef } from 'react';
import { CompanyProfile } from './useProfileData';
import { Building2, Scissors, Shirt, CheckCircle, Flame, Package, Users, Phone, Mail, MapPin, Globe, Zap, ClipboardCheck, Factory, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { StitchingMachine } from './StitchingMachinesInput';
import signatureImage from '@/assets/signature.png';
import logoImage from '@/assets/logo.png';

interface ProfilePreviewPrintProps {
  profile: Partial<CompanyProfile>;
}

export const ProfilePreviewPrint = forwardRef<HTMLDivElement, ProfilePreviewPrintProps>(
  ({ profile }, ref) => {
    const totalTables = (profile.cutting_tables_count || 0) + (profile.checking_tables_count || 0) + 
                        (profile.ironing_tables_count || 0) + (profile.packing_tables_count || 0) +
                        (profile.fabric_inspection_tables_count || 0);
    
    const totalStaff = (profile.cutting_staff || 0) + (profile.stitching_staff || 0) + 
                       (profile.checking_staff || 0) + (profile.ironing_staff || 0) + (profile.packing_staff || 0);

    const getBadgeContent = () => {
      if (profile.company_code) return profile.company_code;
      if (profile.gst_number) return `GST: ${profile.gst_number.slice(-6)}`;
      if (profile.daily_production_capacity) return profile.daily_production_capacity;
      if (profile.total_employees) return `${profile.total_employees} Staff`;
      return null;
    };

    const badgeContent = getBadgeContent();

    const getPowerDisplay = () => {
      const parts: string[] = [];
      if (profile.eb_power_available !== false) parts.push('EB Power');
      if (profile.power_phase) parts.push(profile.power_phase);
      if (profile.power_connection_type) parts.push(profile.power_connection_type);
      return parts.length > 0 ? parts.join(' • ') : 'Available';
    };

    return (
      <div ref={ref} className="bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
        {/* CSS for print page breaks and premium styling */}
        <style>{`
          @media print {
            .print-page-break { page-break-inside: avoid; break-inside: avoid; }
          }
          .section-card { 
            page-break-inside: avoid; 
            break-inside: avoid; 
            margin-bottom: 20px; 
          }
          .profile-container { 
            width: 210mm; 
            min-height: 297mm; 
            margin: 0 auto; 
            position: relative; 
            background: #ffffff;
          }
          .content-wrapper { 
            padding: 0 32px 100px 32px; 
          }
          .footer-section { 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 16px 40px; 
            text-align: center;
            margin-top: 40px;
          }
          .table-row {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-row:nth-child(even) {
            background: #f8fafc;
          }
          .table-row:last-child {
            border-bottom: none;
          }
          .table-label {
            width: 45%;
            padding: 12px 16px;
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
          }
          .table-value {
            width: 55%;
            padding: 12px 16px;
            font-size: 14px;
            color: #1e293b;
            font-weight: 600;
          }
          .badge-yes {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #dcfce7;
            color: #15803d;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-no {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #f1f5f9;
            color: #64748b;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
          }
        `}</style>

        <div className="profile-container">
          {/* Premium Header with Logo */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '32px 40px',
            borderBottom: '4px solid #f59e0b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img src={logoImage} alt="Company Logo" style={{ height: '56px', width: 'auto' }} />
                <div>
                  <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    {profile.company_name || 'Company Name'}
                  </h1>
                  {profile.brand_name && (
                    <p style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>
                      {profile.brand_name}
                    </p>
                  )}
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px', letterSpacing: '0.5px' }}>
                    INFRASTRUCTURE & CAPABILITY PROFILE
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {badgeContent && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#0f172a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}>
                    {badgeContent}
                  </div>
                )}
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '12px' }}>
                  Doc Date: {format(new Date(), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Strip */}
          <div style={{ 
            background: '#f8fafc', 
            padding: '16px 40px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '28px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {profile.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <Phone style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <Mail style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <Globe style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span>{profile.website}</span>
              </div>
            )}
            {profile.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span>{profile.city}, {profile.state}</span>
              </div>
            )}
          </div>

          <div className="content-wrapper">
            {/* Summary Stats - Redesigned */}
            <div className="section-card" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px', 
              padding: '28px 0',
              marginBottom: '24px'
            }}>
              <StatCard icon={<Users />} label="Total Staff" value={profile.total_employees || totalStaff} color="blue" />
              <StatCard icon={<Scissors />} label="Total Tables" value={totalTables} color="emerald" />
              <StatCard icon={<Zap />} label="Power Supply" value={getPowerDisplay()} color="amber" />
              <StatCard icon={<Building2 />} label="Daily Capacity" value={profile.daily_production_capacity || 'Contact Us'} color="violet" />
            </div>

            {/* Utilities Row */}
            <div className="section-card" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <FeatureCard title="Generator" available={profile.generator_available} detail={profile.generator_capacity} />
              <FeatureCard title="Compressor" available={profile.compressor_available} detail={profile.compressor_capacity} />
              <FeatureCard title="Boiler" available={profile.boiler_available} />
            </div>

            {/* Production Capability */}
            <div className="section-card">
              <ProductionCapabilityCard profile={profile} />
            </div>

            {/* Quality Control */}
            <div className="section-card">
              <QualityControlCard profile={profile} />
            </div>

            {/* Cutting Section */}
            <div className="section-card">
              <SectionCard
                icon={<Scissors />}
                title="Cutting Section"
                color="emerald"
                items={[
                  { label: 'Cutting Tables', value: `${profile.cutting_tables_count || 0} (${profile.cutting_table_size || 'Standard'})` },
                  { label: 'Fabric Inspection Tables', value: `${profile.fabric_inspection_tables_count || 0}` },
                  { label: 'Cutting Staff', value: `${profile.cutting_staff || 0} Persons` },
                ]}
                notes={profile.cutting_notes}
              />
            </div>

            {/* Stitching Section */}
            <div className="section-card">
              <StitchingSectionCard profile={profile} />
            </div>

            {/* Checking Section */}
            <div className="section-card">
              <SectionCard
                icon={<CheckCircle />}
                title="Checking Section"
                color="violet"
                items={[
                  { label: 'Checking Tables', value: `${profile.checking_tables_count || 0} (${profile.checking_table_size || 'Standard'})` },
                  { label: 'Checking Staff', value: `${profile.checking_staff || 0} Persons` },
                ]}
                notes={profile.checking_notes}
              />
            </div>

            {/* Ironing Section */}
            <div className="section-card">
              <SectionCard
                icon={<Flame />}
                title="Ironing Section"
                color="orange"
                items={[
                  { label: 'Ironing Tables', value: `${profile.ironing_tables_count || 0}` },
                  { label: 'Steam Irons', value: `${profile.steam_iron_count || 0}` },
                  { label: 'Vacuum Table', value: profile.vacuum_table_available ? 'Available' : 'Not Available', isBadge: true, badgeValue: profile.vacuum_table_available },
                  { label: 'Ironing Staff', value: `${profile.ironing_staff || 0} Persons` },
                ]}
                notes={profile.ironing_notes}
              />
            </div>

            {/* Packing Section */}
            <div className="section-card">
              <SectionCard
                icon={<Package />}
                title="Packing Section"
                color="teal"
                items={[
                  { label: 'Packing Tables', value: `${profile.packing_tables_count || 0}` },
                  { label: 'Storage Racks', value: profile.storage_racks_available ? 'Available' : 'Not Available', isBadge: true, badgeValue: profile.storage_racks_available },
                  { label: 'Polybag Sealing', value: profile.polybag_sealing_available ? 'Available' : 'Not Available', isBadge: true, badgeValue: profile.polybag_sealing_available },
                  { label: 'Tagging/Barcode Support', value: profile.tagging_barcode_support ? 'Available' : 'Not Available', isBadge: true, badgeValue: profile.tagging_barcode_support },
                  { label: 'Carton Packing', value: profile.carton_packing_support ? 'Available' : 'Not Available', isBadge: true, badgeValue: profile.carton_packing_support },
                  { label: 'Packing Staff', value: `${profile.packing_staff || 0} Persons` },
                ]}
                notes={profile.packing_notes}
              />
            </div>

            {/* General Remarks */}
            {profile.general_remarks && (
              <div className="section-card" style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#64748b' }}>📝</span>
                  General Remarks
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#475569', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {profile.general_remarks}
                </p>
              </div>
            )}

            {/* Signature & Signatory Section */}
            <div className="section-card">
              <SignatorySection profile={profile} />
            </div>
          </div>

          {/* Footer - Only appears at the bottom */}
          <div className="footer-section">
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '12px',
              letterSpacing: '0.3px'
            }}>
              Generated by <strong style={{ color: '#f59e0b' }}>Feather Fashions</strong> • {format(new Date(), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ProfilePreviewPrint.displayName = 'ProfilePreviewPrint';

// ============ HELPER COMPONENTS ============

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => {
  const colorStyles: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    blue: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e40af' },
    emerald: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669', text: '#047857' },
    amber: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#b45309' },
    violet: { bg: '#f5f3ff', border: '#c4b5fd', icon: '#7c3aed', text: '#6d28d9' },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div style={{
      background: styles.bg,
      border: `2px solid ${styles.border}`,
      borderRadius: '12px',
      padding: '20px',
      minHeight: '100px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ color: styles.icon, display: 'flex' }}>
          {icon && <span style={{ width: '20px', height: '20px' }}>{icon}</span>}
        </span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: styles.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </span>
      </div>
      <p style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: styles.text,
        lineHeight: '1.3',
        wordBreak: 'break-word'
      }}>
        {value}
      </p>
    </div>
  );
};

const FeatureCard = ({ title, available, detail }: { title: string; available?: boolean | null; detail?: string | null }) => (
  <div style={{
    background: available ? '#ecfdf5' : '#f8fafc',
    border: `2px solid ${available ? '#a7f3d0' : '#e2e8f0'}`,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <p style={{ 
      fontWeight: '600', 
      fontSize: '15px',
      color: available ? '#047857' : '#64748b',
      marginBottom: '4px'
    }}>
      {title}
    </p>
    <p style={{ 
      fontSize: '13px', 
      color: available ? '#059669' : '#94a3b8'
    }}>
      {available ? (detail || 'Available') : 'Not Available'}
    </p>
  </div>
);

const ProductionCapabilityCard = ({ profile }: { profile: Partial<CompanyProfile> }) => (
  <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <div style={{
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#ffffff',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <Factory style={{ width: '20px', height: '20px' }} />
      <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>Production Capability</h3>
    </div>
    <div style={{ background: '#ffffff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Daily Capacity</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{profile.daily_production_capacity || 'Contact Us'}</p>
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>MOQ</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{profile.moq || 'Flexible'}</p>
        </div>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Lead Time</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{profile.lead_time || '30-45 days'}</p>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Sample Lead Time</p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{profile.sample_lead_time || '7-10 days'}</p>
        </div>
      </div>
    </div>
  </div>
);

const QualityControlCard = ({ profile }: { profile: Partial<CompanyProfile> }) => {
  const qcItems = [
    { label: 'Inline Checking', checked: profile.inline_checking },
    { label: 'Final Checking', checked: profile.final_checking ?? true },
    { label: 'Measurement Check', checked: profile.measurement_check ?? true },
    { label: 'AQL Followed', checked: profile.aql_followed },
  ];

  return (
    <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        color: '#ffffff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ClipboardCheck style={{ width: '20px', height: '20px' }} />
        <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>Quality Control Process</h3>
      </div>
      <div style={{ padding: '20px', background: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {qcItems.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 16px',
              background: item.checked ? '#ecfdf5' : '#f8fafc',
              borderRadius: '8px',
              border: `1px solid ${item.checked ? '#a7f3d0' : '#e2e8f0'}`
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: item.checked ? '#22c55e' : '#cbd5e1',
                flexShrink: 0
              }}>
                {item.checked ? (
                  <Check style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                ) : (
                  <X style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                )}
              </div>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: item.checked ? '600' : '500',
                color: item.checked ? '#047857' : '#64748b'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SignatorySection = ({ profile }: { profile: Partial<CompanyProfile> }) => (
  <div style={{ 
    borderTop: '2px solid #e2e8f0', 
    paddingTop: '32px', 
    marginTop: '16px',
    background: '#fafafa',
    padding: '32px',
    borderRadius: '12px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>
        <p style={{ margin: '0 0 4px 0' }}>This document is system generated.</p>
        <p style={{ margin: 0 }}>For queries, contact: <strong style={{ color: '#1e293b' }}>{profile.phone || '9789225510'}</strong></p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <img src={signatureImage} alt="Signature" style={{ height: '60px', marginBottom: '12px' }} />
        <div style={{ 
          borderTop: '2px solid #1e293b', 
          paddingTop: '12px',
          minWidth: '220px'
        }}>
          <p style={{ 
            fontWeight: '700', 
            fontSize: '15px',
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {profile.authorized_signatory_name || profile.contact_person || 'Authorized Signatory'}
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: '#64748b',
            margin: 0
          }}>
            {profile.signatory_designation || 'Managing Director'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const StitchingSectionCard = ({ profile }: { profile: Partial<CompanyProfile> }) => {
  const machines: StitchingMachine[] = profile.stitching_machines 
    ? (typeof profile.stitching_machines === 'string' 
        ? JSON.parse(profile.stitching_machines) 
        : profile.stitching_machines as unknown as StitchingMachine[])
    : [];

  const totalMachines = machines.reduce((sum, m) => sum + (m.count || 0), 0);

  return (
    <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shirt style={{ width: '20px', height: '20px' }} />
          <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>Stitching Section</h3>
        </div>
        {totalMachines > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            Total: {totalMachines} Machines
          </div>
        )}
      </div>
      <div style={{ background: '#ffffff' }}>
        {/* Staff Info */}
        <div style={{ 
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Stitching Staff</span>
          <span style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>{profile.stitching_staff || 0} Persons</span>
        </div>

        {/* Machine Table */}
        {machines.length > 0 && (
          <div style={{ padding: '16px 20px' }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Stitching Machines Available
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>Machine Type</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>Count</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>Brand</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1e293b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                      {machine.type === 'Others' ? machine.customType : machine.type}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1e293b', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>
                      {machine.count}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      {machine.brand || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {profile.stitching_notes && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>{profile.stitching_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ icon, title, color, items, notes }: { 
  icon: React.ReactNode; 
  title: string; 
  color: string;
  items: { label: string; value: string | number; isBadge?: boolean; badgeValue?: boolean | null }[];
  notes?: string | null;
}) => {
  const headerColors: Record<string, string> = {
    emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    violet: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    orange: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  };

  return (
    <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{
        background: headerColors[color] || headerColors.blue,
        color: '#ffffff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ width: '20px', height: '20px', display: 'flex' }}>{icon}</span>
        <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ background: '#ffffff' }}>
        {items.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex',
              borderBottom: idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
              background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
            }}
          >
            <div style={{ 
              width: '45%', 
              padding: '14px 20px',
              fontSize: '13px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {item.label}
            </div>
            <div style={{ 
              width: '55%', 
              padding: '14px 20px',
              fontSize: '14px',
              color: '#1e293b',
              fontWeight: '600'
            }}>
              {item.isBadge ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: item.badgeValue ? '#dcfce7' : '#f1f5f9',
                  color: item.badgeValue ? '#15803d' : '#64748b',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {item.badgeValue ? (
                    <Check style={{ width: '12px', height: '12px' }} />
                  ) : (
                    <X style={{ width: '12px', height: '12px' }} />
                  )}
                  {item.badgeValue ? 'Available' : 'Not Available'}
                </span>
              ) : (
                item.value
              )}
            </div>
          </div>
        ))}
        {notes && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
