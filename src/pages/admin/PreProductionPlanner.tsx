import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Ruler, 
  Palette, 
  FileText, 
  FolderOpen, 
  Zap, 
  GitBranch, 
  Mic, 
  Factory,
  Layers
} from 'lucide-react';
import StyleMasterTab from '@/components/admin/pre-production/StyleMasterTab';
import MeasurementBuilderTab from '@/components/admin/pre-production/MeasurementBuilderTab';
import TechDiagramsTab from '@/components/admin/pre-production/TechDiagramsTab';
import PatternLibraryTab from '@/components/admin/pre-production/PatternLibraryTab';
import TechPackGeneratorTab from '@/components/admin/pre-production/TechPackGeneratorTab';
import VersionControlTab from '@/components/admin/pre-production/VersionControlTab';
import VoiceInputTab from '@/components/admin/pre-production/VoiceInputTab';
import FactoryViewTab from '@/components/admin/pre-production/FactoryViewTab';

const tabs = [
  { id: 'styles', label: 'Style Master', icon: Layers, color: 'text-violet-500' },
  { id: 'measurements', label: 'Measurements', icon: Ruler, color: 'text-blue-500' },
  { id: 'diagrams', label: 'Tech Diagrams', icon: Palette, color: 'text-emerald-500' },
  { id: 'patterns', label: 'Patterns', icon: FolderOpen, color: 'text-amber-500' },
  { id: 'techpack', label: 'Tech Pack', icon: Zap, color: 'text-orange-500' },
  { id: 'versions', label: 'Version Control', icon: GitBranch, color: 'text-pink-500' },
  { id: 'voice', label: 'Voice Input', icon: Mic, color: 'text-red-500' },
  { id: 'factory', label: 'Factory View', icon: Factory, color: 'text-cyan-500' },
];

export default function PreProductionPlanner() {
  const [activeTab, setActiveTab] = useState('styles');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Pre-Production Planner</h1>
                <p className="text-sm text-muted-foreground">
                  Tech Packs · Measurements · Patterns · Sampling · Approvals · Versions · Factory View
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Production Planning Suite
            </Badge>
            {selectedStyleId && (
              <Badge className="text-xs bg-emerald-500 text-white">
                Style Selected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Steps Banner */}
      <div className="bg-muted/30 border-b px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-medium min-w-max">
          {['Tech Packs', 'Measurements', 'Patterns', 'Sampling', 'Approvals', 'Revisions', 'Final Production Lock'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-foreground/70 hover:text-foreground transition-colors">
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {step}
              </div>
              {i < 6 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full h-auto p-1 gap-1 bg-muted/50 overflow-x-auto justify-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <tab.icon className={`h-4 w-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="styles" className="mt-0">
              <StyleMasterTab selectedStyleId={selectedStyleId} onSelectStyle={setSelectedStyleId} />
            </TabsContent>
            <TabsContent value="measurements" className="mt-0">
              <MeasurementBuilderTab selectedStyleId={selectedStyleId} />
            </TabsContent>
            <TabsContent value="diagrams" className="mt-0">
              <TechDiagramsTab selectedStyleId={selectedStyleId} />
            </TabsContent>
            <TabsContent value="patterns" className="mt-0">
              <PatternLibraryTab selectedStyleId={selectedStyleId} />
            </TabsContent>
            <TabsContent value="techpack" className="mt-0">
              <TechPackGeneratorTab selectedStyleId={selectedStyleId} />
            </TabsContent>
            <TabsContent value="versions" className="mt-0">
              <VersionControlTab selectedStyleId={selectedStyleId} />
            </TabsContent>
            <TabsContent value="voice" className="mt-0">
              <VoiceInputTab onStyleCreated={(id) => { setSelectedStyleId(id); setActiveTab('styles'); }} />
            </TabsContent>
            <TabsContent value="factory" className="mt-0">
              <FactoryViewTab selectedStyleId={selectedStyleId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
