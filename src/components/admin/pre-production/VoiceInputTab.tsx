import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Wand2, Send, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props { onStyleCreated: (id: string) => void; }

const SAMPLE_PROMPTS = [
  "Women pyjama set, cotton jersey, 180 GSM, round neck, short sleeve, relaxed fit, top length 26 inches for size M",
  "Men's cotton boxer shorts, 160 GSM, elastic waistband, 2-button fly, relaxed fit for export to UAE",
  "Kids nightwear set, floral printed cotton, 140 GSM, round neck, full sleeve top with elastic waist pants, ages 4-12",
  "Women high-waist yoga leggings, polyester spandex, 220 GSM, 4-way stretch, ankle length, for UK buyer",
];

function parseVoiceInput(text: string) {
  const lower = text.toLowerCase();
  const gsm = lower.match(/(\d+)\s*gsm/)?.[1] || '';
  const fabric = lower.match(/(cotton jersey|polyester|nylon|modal|spandex|satin|poplin|voile|rib knit|cotton)/i)?.[1] || '';
  const category = lower.includes('pyjama') ? 'Pyjama Set'
    : lower.includes('legging') ? 'Leggings'
    : lower.includes('nightwear') || lower.includes('nightgown') ? 'Nightwear'
    : lower.includes('kurti') ? 'Kurti'
    : lower.includes('sportswear') || lower.includes('yoga') ? 'Sportswear'
    : lower.includes('kids') || lower.includes('children') ? 'Kidswear'
    : lower.includes('innerwear') || lower.includes('bralette') || lower.includes('boxer') ? 'Innerwear'
    : 'Nightwear';
  const buyer = lower.match(/for\s+([a-z\s]+)\s+buyer/i)?.[1] || lower.match(/export to\s+([a-z\s]+)/i)?.[1] || '';
  const season = lower.match(/(ss|aw|spring|autumn|summer|winter)\s*20\d\d/i)?.[0] || '';
  const neck = lower.match(/(round neck|v-neck|collar|mandarin)/i)?.[0] || '';
  const sleeves = lower.match(/(short sleeve|long sleeve|full sleeve|sleeveless|flutter sleeve)/i)?.[0] || '';
  const fit = lower.match(/(relaxed fit|slim fit|regular fit|oversized|compression)/i)?.[0] || '';

  const words = text.split(' ').map((w, i) => w.charAt(0).toUpperCase() + w.slice(1));
  const styleName = words.slice(0, Math.min(words.length, 5)).join(' ');
  const styleCode = `FF-VP-${Date.now().toString().slice(-4)}`;

  return {
    style_code: styleCode,
    style_name: styleName,
    category,
    fabric_type: fabric,
    gsm,
    description: `${neck}${neck ? ', ' : ''}${sleeves}${sleeves ? ', ' : ''}${fit}. ${text}`.trim(),
    buyer: buyer.trim(),
    season: season.trim(),
    construction_type: category.includes('Knit') || fabric.toLowerCase().includes('jersey') ? 'Single Jersey Knit' : 'Woven',
    stitch_type: 'Overlock + Cover Stitch',
    status: 'Draft',
    target_market: buyer || '',
  };
}

export default function VoiceInputTab({ onStyleCreated }: Props) {
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported in this browser. Use Chrome.'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) { text += event.results[i][0].transcript; }
      setTranscript(text);
    };
    recognition.onerror = () => { setIsRecording(false); };
    recognition.onend = () => { setIsRecording(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const processInput = async () => {
    if (!transcript) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    setParsed(parseVoiceInput(transcript));
    setProcessing(false);
  };

  const createStyle = useMutation({
    mutationFn: async () => {
      if (!parsed) throw new Error('Process voice input first');
      const { data, error } = await supabase.from('pp_styles').insert([{ ...parsed, version: 1 }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pp-styles'] });
      toast.success('Style created from voice input!');
      onStyleCreated(data.id);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4 text-red-500" />
            Voice → Tech Pack (Superpower)
          </CardTitle>
          <p className="text-sm text-muted-foreground">Speak your style details — AI converts speech to a complete style entry with measurements starter</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                  : 'bg-background hover:bg-muted border-2 border-red-200'
              }`}
            >
              {isRecording ? <MicOff className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-red-500" />}
              {isRecording && (
                <span className="absolute -inset-1 rounded-full border-4 border-red-300 animate-ping opacity-75" />
              )}
            </button>
            <div className="text-center">
              <p className="font-semibold">{isRecording ? 'Listening...' : 'Click to speak'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isRecording ? 'Click again to stop recording' : 'Describe your style in plain language'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick prompts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sample Voice Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              className="w-full text-left text-xs p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors border"
              onClick={() => setTranscript(prompt)}
            >
              <span className="text-muted-foreground mr-2">▷</span>{prompt}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Transcript</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setTranscript(''); setParsed(null); }} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Clear
              </Button>
              <Button size="sm" onClick={processInput} disabled={!transcript || processing} className="gap-1 text-xs">
                <Wand2 className="h-3.5 w-3.5" />
                {processing ? 'Processing...' : 'Process with AI'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Speak or type your style description here..."
            rows={4}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Parsed result */}
      {parsed && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                AI Extracted Style Fields
              </CardTitle>
              <Badge className="bg-emerald-500 text-white text-xs">Ready to create</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {[
                ['Style Code', 'style_code'],
                ['Style Name', 'style_name'],
                ['Category', 'category'],
                ['Fabric Type', 'fabric_type'],
                ['GSM', 'gsm'],
                ['Buyer', 'buyer'],
                ['Season', 'season'],
                ['Status', 'status'],
                ['Construction', 'construction_type'],
              ].map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    value={parsed[key] || ''}
                    onChange={e => setParsed((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1 mb-4">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={parsed.description || ''} onChange={e => setParsed((p: any) => ({ ...p, description: e.target.value }))} rows={2} className="text-xs" />
            </div>
            <Button onClick={() => createStyle.mutate()} disabled={createStyle.isPending} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {createStyle.isPending ? 'Creating Style...' : 'Create Style from Voice Input'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
