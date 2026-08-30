'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Box,
  Type,
  Image as ImageIcon,
  FormInput,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Scaling,
  Blocks,
  Code2,
  Eye,
  Settings2,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Database,
  Server,
  GitBranch,
  Repeat,
  Globe,
  Workflow,
  Zap,
  ArrowRight,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Types
type LayerType = 'text' | 'shape' | 'image' | 'input';
type LayerConfig = {
  id: string;
  type: LayerType;
  colour: string;
  w: number;
  h: number;
  x: number;
  y: number;
  z: number;
  text?: string;
  fontSize?: number;
  bold?: boolean;
  vertices?: number;
  rounded?: string;
  imageUrl?: string;
  placeholder?: string;
  boxLength?: number;
};
type ObjConfig = {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  bg: string | null;
  hr: [number, number];
  wr: [number, number];
  layers: LayerConfig[];
};
type PageConfig = { id: string; title: string; bg: string; w: number; h: number };

type BlockType =
  | 'function'
  | 'conditional'
  | 'loop'
  | 'boolean'
  | 'api_call'
  | 'api_make'
  | 'collect'
  | 'db_create'
  | 'db_insert'
  | 'db_find'
  | 'db_update'
  | 'db_delete'
  | 'auth_signup'
  | 'auth_login'
  | 'auth_oauth';
type Block = { id: string; type: BlockType; config: Record<string, string>; enabled: boolean; next: string | null };

const BLOCK_DEFS: Record<BlockType, { label: string; color: string; icon: string; desc: string; fields: { key: string; label: string; ph: string }[] }> = {
  function: { label: 'Function', color: '#8b5cf6', icon: 'ƒ', desc: 'crescent.function', fields: [{ key: 'function_id', label: 'ID', ph: 'greet' }, { key: 'params', label: 'Params', ph: 'name' }, { key: 'body', label: 'Body', ph: "(name)=>`Hello ${name}`" }] },
  conditional: { label: 'Conditional', color: '#ec4899', icon: 'if', desc: 'crescent.conditional', fields: [{ key: 'conditional_id', label: 'ID', ph: 'age_check' }, { key: 'check', label: 'Check', ph: 'user.age>=18' }] },
  loop: { label: 'Loop', color: '#f59e0b', icon: '↻', desc: 'crescent.loop', fields: [{ key: 'loop_id', label: 'ID', ph: 'count' }, { key: 'loop_type', label: 'Type', ph: 'for|while|for_in' }] },
  boolean: { label: 'Boolean', color: '#06b6d4', icon: '∧', desc: 'crescent.boolean', fields: [{ key: 'boolean_id', label: 'ID', ph: 'access' }, { key: 'operator', label: 'Operator', ph: 'AND|OR|NOT' }] },
  api_call: { label: 'API Call', color: '#10b981', icon: '↗', desc: 'crescent.api_call', fields: [{ key: 'api_call_id', label: 'ID', ph: 'fetchUsers' }, { key: 'url', label: 'URL', ph: 'https://api.example.com' }, { key: 'method', label: 'Method', ph: 'GET' }] },
  api_make: { label: 'API Server', color: '#6366f1', icon: '⚡', desc: 'crescent.api_make', fields: [{ key: 'api_id', label: 'ID', ph: 'my_api' }, { key: 'port', label: 'Port', ph: '3000' }, { key: 'route', label: 'Route', ph: 'POST /api/contact' }] },
  collect: { label: 'Collect', color: '#a78bfa', icon: '◐', desc: 'crescent.collect', fields: [{ key: 'collect_id', label: 'ID', ph: 'form_data' }, { key: 'sources', label: 'Sources', ph: 'nameInput, emailInput' }] },
  db_create: { label: 'DB Create', color: '#f97316', icon: 'DB', desc: 'crescent.db.create', fields: [{ key: 'collection', label: 'Collection', ph: 'contacts' }] },
  db_insert: { label: 'DB Insert', color: '#f97316', icon: 'DB', desc: 'crescent.db.insert', fields: [{ key: 'collection', label: 'Collection', ph: 'contacts' }, { key: 'document', label: 'Document', ph: "{ name:'Ada', email:'ada@ex.com' }" }] },
  db_find: { label: 'DB Find', color: '#f97316', icon: 'DB', desc: 'crescent.db.find', fields: [{ key: 'collection', label: 'Collection', ph: 'contacts' }, { key: 'query', label: 'Query', ph: '{age:{$gte:18}}' }] },
  db_update: { label: 'DB Update', color: '#f97316', icon: 'DB', desc: 'crescent.db.update', fields: [{ key: 'collection', label: 'Collection', ph: 'users' }, { key: 'query', label: 'Query', ph: "{name:'Ada'}" }, { key: 'update', label: 'Update', ph: '{age:31}' }] },
  db_delete: { label: 'DB Delete', color: '#ef4444', icon: 'DB', desc: 'crescent.db.delete', fields: [{ key: 'collection', label: 'Collection', ph: 'users' }, { key: 'query', label: 'Query', ph: '{age:35}' }] },
  auth_signup: { label: 'Auth Signup', color: '#14b8a6', icon: '✦', desc: 'crescent.auth.signup', fields: [{ key: 'collection', label: 'Collection', ph: 'users' }] },
  auth_login: { label: 'Auth Login', color: '#14b8a6', icon: '✦', desc: 'crescent.auth.login', fields: [{ key: 'collection', label: 'Collection', ph: 'users' }, { key: 'max_attempts', label: 'Max attempts', ph: '5' }] },
  auth_oauth: { label: 'Auth OAuth', color: '#14b8a6', icon: '✦', desc: 'crescent.auth.oauth', fields: [{ key: 'provider', label: 'Provider', ph: 'google' }, { key: 'redirect_uri', label: 'Redirect', ph: 'http://localhost:3000/callback' }] },
};

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 6)}`;

const defaultLayer = (t: LayerType, id: string): LayerConfig => {
  if (t === 'text') return { id, type: t, colour: '15,23,42', w: 200, h: 32, x: 0, y: 0, z: 0, text: 'Hello Crescent', fontSize: 18, bold: true, rounded: '0px' } as LayerConfig;
  if (t === 'shape') return { id, type: t, colour: '124,58,237', w: 180, h: 80, x: 0, y: 0, z: 0, vertices: 4, rounded: '8px' } as LayerConfig;
  if (t === 'image') return { id, type: t, colour: '124,58,237', w: 220, h: 140, x: 0, y: 0, z: 0, imageUrl: 'https://picsum.photos/300/150' } as LayerConfig;
  return { id, type: t, colour: '255,255,255', w: 240, h: 44, x: 0, y: 0, z: 0, placeholder: 'Enter text…', boxLength: 20 } as LayerConfig;
};

const genFrontend = (page: PageConfig, objs: ObjConfig[]) => {
  let s = `const crescent = require('crescent-js');\n\n`;
  s += `const page = crescent.page({ page_id: '${page.id}', page_title: '${page.title}', page_bg: '${page.bg}', size: { height: ${page.h}, width: ${page.w} } });\n\n`;
  for (const o of objs) {
    s += `const ${o.id} = crescent.object({ object_id: '${o.id}', size: { height: ${o.h}, width: ${o.w} } });\n`;
    for (const l of o.layers) {
      if (l.type === 'text') s += `${o.id}.add_layer(crescent.layer({ layer_type: 'text', layer_id: '${l.id}', text: '${(l.text || '').replace(/'/g, "\\'")}', size: ${l.fontSize || 16}, colour: '${l.colour}', bold: ${!!l.bold} }));\n`;
      else if (l.type === 'shape') s += `${o.id}.add_layer(crescent.layer({ layer_type: 'shape', layer_id: '${l.id}', layer_vertices: ${l.vertices ?? 4}, colour: '${l.colour}', size: { height: ${l.h}, width: ${l.w} }, rounded_corners: '${l.rounded || '8px'}' }));\n`;
      else if (l.type === 'image') s += `${o.id}.add_layer(crescent.layer({ layer_type: 'image', layer_id: '${l.id}', image_location: '${l.imageUrl}', size: { height: ${l.h}, width: ${l.w} } }));\n`;
      else s += `${o.id}.add_layer(crescent.layer({ layer_type: 'input', layer_id: '${l.id}', input_method: 'text box', box_inner_text: '${(l.placeholder || '').replace(/'/g, "\\'")}', box_length: ${l.boxLength || 20}, size: { height: ${l.h}, width: ${l.w} } }));\n`;
      if (l.x !== 0 || l.y !== 0) s += `${o.id}.set_layer_position('${l.id}', ${l.x}, ${l.y});\n`;
    }
    s += `page.add_object(${o.id});\n`;
    if (o.x !== 0 || o.y !== 0) s += `page.set_object_position('${o.id}', ${o.x}, ${o.y});\n`;
    if (o.hr[0] !== 0 || o.hr[1] !== 0 || o.wr[0] !== 0 || o.wr[1] !== 0) s += `page.set_scaling_ratio('${o.id}', [${o.hr.join(',')}], [${o.wr.join(',')}]);\n`;
    s += `\n`;
  }
  s += `// 0,0 = fill screen on that axis\n// crescent.responsive({ page }).init();\n// page.render();\n`;
  return s;
};

const genBackend = (blocks: Block[]) => {
  if (!blocks.length) return '// Add blocks from the palette — they connect top → bottom (or via next).';
  // order by next chain if present, else insertion order
  const ordered: Block[] = [];
  const visited = new Set<string>();
  let cur = blocks.find(b => !blocks.some(x => x.next === b.id)) || blocks[0];
  // If next links exist, follow them; otherwise use array order
  const hasLinks = blocks.some(b => b.next);
  if (hasLinks && cur) {
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id);
      ordered.push(cur);
      const nxt = cur.next ? blocks.find(b => b.id === cur!.next) : null;
      if (!nxt) break;
      cur = nxt;
    }
    // add isolated
    for (const b of blocks) if (!visited.has(b.id)) ordered.push(b);
  } else {
    ordered.push(...blocks);
  }
  let s = `const crescent = require('crescent-js');\n\n`;
  for (const b of ordered) {
    switch (b.type) {
      case 'function': s += `const ${b.config.function_id || 'fn'} = crescent.function({ function_id: '${b.config.function_id || 'fn'}', params: [${(b.config.params || '').split(',').map(x => `'${x.trim()}'`).filter(Boolean).join(', ')}], body: ${b.config.body || '()=>{}'} });\n`; break;
      case 'conditional': s += `const ${b.config.conditional_id || 'chk'} = crescent.conditional({ conditional_id: '${b.config.conditional_id || 'chk'}', if: { check: () => ${b.config.check || 'true'}, actions: [] }, else: { actions: [] } });\n`; break;
      case 'loop': s += `const ${b.config.loop_id || 'lp'} = crescent.loop({ loop_id: '${b.config.loop_id || 'lp'}', loop_type: '${b.config.loop_type || 'for'}', start: 0, end: 10, step: 1, actions: [(i)=>console.log(i)] });\n`; break;
      case 'boolean': s += `const ${b.config.boolean_id || 'fl'} = crescent.boolean({ boolean_id: '${b.config.boolean_id || 'fl'}', value1: true, value2: false, operator: '${b.config.operator || 'AND'}' });\n`; break;
      case 'api_call': s += `const ${b.config.api_call_id || 'call'} = crescent.api_call({ api_call_id: '${b.config.api_call_id || 'call'}', url: '${b.config.url || 'https://api.example.com'}', method: '${b.config.method || 'GET'}' }); // await ${b.config.api_call_id || 'call'}.call()\n`; break;
      case 'api_make': s += `const ${b.config.api_id || 'api'} = crescent.api_make({ api_id: '${b.config.api_id || 'api'}', port: ${b.config.port || '3000'} });\n${b.config.api_id || 'api'}.add_endpoint('${(b.config.route || 'GET /users').split(' ')[0]}', '${(b.config.route || 'GET /users').split(' ')[1] || '/users'}', (req,res)=>{ res.writeHead(200); res.end(JSON.stringify({ok:true})); });\n// await ${b.config.api_id || 'api'}.start()\n`; break;
      case 'collect': s += `const ${b.config.collect_id || 'data'} = crescent.collect({ collect_id: '${b.config.collect_id || 'data'}', sources: [${b.config.sources || ''}], transform: d=>d }); // ${b.config.collect_id || 'data'}.collect()\n`; break;
      case 'db_create': s += `crescent.db.create('${b.config.collection || 'col'}');\n`; break;
      case 'db_insert': s += `crescent.db.insert('${b.config.collection || 'col'}', ${b.config.document || '{}'});\n`; break;
      case 'db_find': s += `crescent.db.find('${b.config.collection || 'col'}', ${b.config.query || '{}'});\n`; break;
      case 'db_update': s += `crescent.db.update('${b.config.collection || 'col'}', ${b.config.query || '{}'}, ${b.config.update || '{}'});\n`; break;
      case 'db_delete': s += `crescent.db.delete('${b.config.collection || 'col'}', ${b.config.query || '{}'});\n`; break;
      case 'auth_signup': s += `const signup = crescent.auth.signup({ collection: '${b.config.collection || 'users'}' }); // await signup.register(username,email,password)\n`; break;
      case 'auth_login': s += `const login = crescent.auth.login({ collection: '${b.config.collection || 'users'}', max_attempts: ${b.config.max_attempts || '5'} }); // await login.authenticate(username,password)\n`; break;
      case 'auth_oauth': s += `const oauth = crescent.auth.oauth({ providers: { ${b.config.provider || 'google'}: { redirect_uri: '${b.config.redirect_uri || 'http://localhost:3000/callback'}' } } });\n`; break;
    }
    s += `\n`;
  }
  s += `// Chain: ${ordered.map(b => BLOCK_DEFS[b.type].label).join(' → ')}\n// Run: crescent run app.js\n`;
  return s;
};

const getBreakpoint = (w: number) => (w <= 480 ? 'mobile' : w <= 768 ? 'tablet' : w <= 1200 ? 'desktop' : 'large');

export default function Playground() {
  const [tab, setTab] = useState<'frontend' | 'scaling' | 'backend' | 'pipeline'>('frontend');
  const [page, setPage] = useState<PageConfig>({ id: 'home', title: 'My Crescent App', bg: '248,249,250', w: 1200, h: 800 });
  const [objs, setObjs] = useState<ObjConfig[]>([
    {
      id: 'hero',
      w: 560,
      h: 220,
      x: 0,
      y: 120,
      bg: null,
      hr: [0, 0],
      wr: [0, 0],
      layers: [
        { id: 'title', type: 'text', colour: '15,23,42', w: 500, h: 36, x: 0, y: 50, z: 1, text: 'Build faster with Crescent', fontSize: 28, bold: true },
        { id: 'subtitle', type: 'text', colour: '100,116,139', w: 460, h: 20, x: 0, y: 12, z: 1, text: 'Frontend + backend + DB + auth — one framework.', fontSize: 14 },
        { id: 'cta', type: 'shape', colour: '124,58,237', w: 160, h: 44, x: 0, y: -50, z: 0, vertices: 4, rounded: '10px' },
        { id: 'ctaText', type: 'text', colour: '255,255,255', w: 140, h: 20, x: 0, y: -50, z: 2, text: 'Get Started →', fontSize: 14, bold: true },
      ],
    },
    {
      id: 'card',
      w: 360,
      h: 200,
      x: 0,
      y: -160,
      bg: '255,255,255',
      hr: [0, 0],
      wr: [0, 0],
      layers: [
        { id: 'email', type: 'input', colour: '255,255,255', w: 260, h: 44, x: 0, y: 30, z: 1, placeholder: 'Enter your email', boxLength: 22 },
        { id: 'btn', type: 'shape', colour: '16,185,129', w: 260, h: 44, x: 0, y: -30, z: 0, vertices: 4, rounded: '8px' },
        { id: 'btnText', type: 'text', colour: '255,255,255', w: 120, h: 20, x: 0, y: -30, z: 2, text: 'Subscribe', fontSize: 14, bold: true },
      ],
    },
  ]);
  const [selO, setSelO] = useState('hero');
  const [selL, setSelL] = useState<string | null>('title');
  const [vp, setVp] = useState(1200);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid('blk'), type: 'db_create', config: { collection: 'contacts' }, enabled: true, next: null },
    { id: uid('blk'), type: 'api_make', config: { api_id: 'my_api', port: '3000', route: 'POST /api/contact' }, enabled: true, next: null },
    { id: uid('blk'), type: 'db_insert', config: { collection: 'contacts', document: "{ name: 'Ada', email: 'ada@example.com' }" }, enabled: true, next: null },
  ]);
  const [selB, setSelB] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [out, setOut] = useState('');
  const [pipelineResult, setPipelineResult] = useState('');

  const selObj = useMemo(() => objs.find(o => o.id === selO) || objs[0], [objs, selO]);
  const selLay = useMemo(() => selObj?.layers.find(l => l.id === selL) || null, [selObj, selL]);
  const brk = getBreakpoint(vp);
  const sc = vp / page.w;
  const fCode = useMemo(() => genFrontend(page, objs), [page, objs]);
  const bCode = useMemo(() => genBackend(blocks), [blocks]);
  const fullCode = useMemo(() => `${fCode}\n// --- Backend ---\n${bCode}`, [fCode, bCode]);

  const updO = (id: string, p: Partial<ObjConfig>) => setObjs(v => v.map(o => (o.id === id ? { ...o, ...p } : o)));
  const updL = (oid: string, lid: string, p: Partial<LayerConfig>) => setObjs(v => v.map(o => (o.id === oid ? { ...o, layers: o.layers.map(l => (l.id === lid ? { ...l, ...p } : l)) } : o)));
  const addO = () => {
    const o: ObjConfig = { id: `object_${objs.length + 1}`, w: 360, h: 200, x: 0, y: 0, bg: null, hr: [0, 0], wr: [0, 0], layers: [] };
    setObjs([...objs, o]);
    setSelO(o.id);
    setSelL(null);
  };
  const addL = (t: LayerType) => {
    if (!selObj) return;
    const id = `${t}_${Date.now().toString(36).slice(2, 4)}`;
    const l = defaultLayer(t, id);
    setObjs(v => v.map(o => (o.id === selObj.id ? { ...o, layers: [...o.layers, l] } : o)));
    setSelL(l.id);
  };
  const addB = (t: BlockType) => {
    const b: Block = { id: uid('blk'), type: t, config: Object.fromEntries(BLOCK_DEFS[t].fields.map(f => [f.key, ''])), enabled: true, next: null };
    setBlocks([...blocks, b]);
    setSelB(b.id);
  };
  const connectBlocks = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setBlocks(v => v.map(b => (b.id === fromId ? { ...b, next: toId } : b)));
    setConnectFrom(null);
  };
  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  const play = () => {
    const ordered = blocks.length ? blocks.map(b => BLOCK_DEFS[b.type].label).join(' → ') : '—';
    setOut(
      [
        `▶ Simulated run — Page ${page.id} ${page.w}×${page.h} • ${objs.length} objects • ${vp}px (${brk}) scale ${sc.toFixed(3)}`,
        '',
        `Backend chain (${blocks.length}): ${ordered}`,
        ...blocks.map((b, i) => `${i + 1}. ${BLOCK_DEFS[b.type].label} ${b.enabled ? '✓' : '⊘'} ${Object.entries(b.config).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(' ')}`.trim()),
        '',
        'Copy code → crescent run app.js',
      ].join('\n')
    );
  };
  const runPipeline = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '');
    const email = String(fd.get('email') || '');
    const contact = String(fd.get('contact') || '');
    const chain = blocks.map(b => b.type).join(' → ');
    setPipelineResult(JSON.stringify({ name, email, contact: contact || null, submitted_at: new Date().toISOString(), chain, page: page.id, objects: objs.map(o => o.id) }, null, 2));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="sticky top-16 z-30 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-bold">☾</div>
          <div>
            <div className="text-sm font-semibold">Playground</div>
            <div className="text-[11px] text-zinc-500">Frontend scaling • Visual builder • Block backend • Fullstack pipeline — export to app.js</div>
          </div>
          <div className="ml-auto hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-400 sm:flex">
            <Sparkles className="h-3 w-3 text-purple-400" /> Crescent.js only — no CSS needed
          </div>
          <Link href="/docs/playground" className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 sm:inline-flex">
            Guide
          </Link>
        </div>
        <div className="mx-auto flex max-w-[1600px] gap-1 px-4 pb-3 sm:px-6">
          {[
            { id: 'frontend', label: 'Frontend', icon: Layers },
            { id: 'scaling', label: 'Scaling', icon: Scaling },
            { id: 'backend', label: 'Backend', icon: Blocks },
            { id: 'pipeline', label: 'Pipeline', icon: Workflow },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === t.id ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.id}</span>
            </button>
          ))}
          <button
            onClick={() => setShowCode(v => !v)}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${showCode ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            <Code2 className="h-4 w-4" />
            {showCode ? 'Hide code' : 'Show code'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        {/* FRONTEND */}
        {tab === 'frontend' && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Objects</div>
                {objs.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelO(o.id);
                      setSelL(o.layers[0]?.id || null);
                    }}
                    className={`mb-1.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selO === o.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5" />
                      {o.id} <span className="text-[11px] opacity-60">({o.w}×{o.h})</span>
                    </span>
                    <span className="text-[11px] opacity-60">{o.layers.length} layers</span>
                  </button>
                ))}
                <div className="mt-3 flex gap-2">
                  <button onClick={addO} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-black">
                    <Plus className="h-3.5 w-3.5" />Add object
                  </button>
                  <button onClick={() => selObj && setObjs(v => v.filter(o => o.id !== selObj.id))} className="rounded-lg bg-white/10 px-3 py-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Add layer to <span className="text-purple-300">{selObj?.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { t: 'text' as const, ic: Type, label: 'Text' },
                    { t: 'shape' as const, ic: Box, label: 'Shape' },
                    { t: 'image' as const, ic: ImageIcon, label: 'Image' },
                    { t: 'input' as const, ic: FormInput, label: 'Input' },
                  ].map(b => (
                    <button key={b.t} onClick={() => addL(b.t)} className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2.5 text-sm text-zinc-200 hover:bg-white/10">
                      <b.ic className="h-4 w-4" />
                      {b.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  {selObj?.layers.map(l => (
                    <div key={l.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${selL === l.id ? 'bg-white text-black' : 'bg-white/5 text-zinc-300'}`}>
                      <button onClick={() => setSelL(l.id)} className="flex flex-1 items-center gap-2 text-left text-xs">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-black/10 text-[10px] font-bold">{l.type[0].toUpperCase()}</span>
                        {l.id} <span className="text-[11px] opacity-60">({l.x},{l.y})</span>
                      </button>
                      <button
                        onClick={() => {
                          setObjs(v => v.map(o => (o.id === selObj.id ? { ...o, layers: o.layers.filter(x => x.id !== l.id) } : o)));
                          if (selL === l.id) setSelL(null);
                        }}
                        className="rounded p-1 hover:bg-black/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {!selObj?.layers.length && <div className="py-2 text-center text-xs text-zinc-500">No layers — add one</div>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                  <span className="text-xs text-zinc-400">Viewport</span>
                  <input type="range" min={320} max={1400} value={vp} onChange={e => setVp(Number(e.target.value))} className="w-32 accent-purple-500" />
                  <span className="font-mono text-xs text-white">{vp}px</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${brk === 'mobile' ? 'bg-emerald-500/20 text-emerald-300' : brk === 'tablet' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>{brk}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Eye className="h-3.5 w-3.5" /> scale {sc.toFixed(3)}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f0f14] p-3">
                <div
                  className="mx-auto overflow-hidden rounded-lg border border-white/10 bg-white"
                  style={{
                    width: page.w,
                    height: page.h,
                    transform: `scale(${Math.min(1, vp / page.w)})`,
                    transformOrigin: 'top left',
                    marginBottom: Math.min(1, vp / page.w) !== 1 ? `calc(${page.h}px * ${Math.min(1, vp / page.w)} - ${page.h}px)` : undefined,
                  }}
                >
                  <div className="relative h-full w-full" style={{ background: `rgb(${page.bg})` }}>
                    {objs.map(o => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setSelO(o.id);
                          setSelL(o.layers[0]?.id || null);
                        }}
                        className={`absolute overflow-hidden border ${selO === o.id ? 'border-purple-500' : 'border-white/20'} cursor-pointer`}
                        style={{ width: o.w, height: o.h, left: page.w / 2 + o.x, top: page.h / 2 - o.y, transform: 'translate(-50%,-50%)', background: o.bg ? `rgb(${o.bg})` : 'transparent', zIndex: 1, borderRadius: 12 }}
                      >
                        {o.layers.map(l => {
                          const st: React.CSSProperties = {
                            position: 'absolute',
                            left: `calc(50% + ${l.x}px)`,
                            top: `calc(50% - ${l.y}px)`,
                            transform: 'translate(-50%,-50%)',
                            width: l.w,
                            height: l.h,
                            borderRadius: 4,
                            zIndex: l.z,
                            outline: selL === l.id && selO === o.id ? '2px solid #8b5cf6' : undefined,
                            overflow: 'hidden',
                          };
                          if (l.type === 'text')
                            return (
                              <div
                                key={l.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelO(o.id);
                                  setSelL(l.id);
                                }}
                                style={{ ...st, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: l.fontSize, color: `rgb(${l.colour})`, fontWeight: l.bold ? 700 : 400, cursor: 'pointer' }}
                              >
                                {l.text}
                              </div>
                            );
                          if (l.type === 'shape')
                            return <div key={l.id} onClick={e => { e.stopPropagation(); setSelO(o.id); setSelL(l.id); }} style={{ ...st, background: `rgb(${l.colour})`, borderRadius: l.vertices === 0 ? '50%' : l.rounded, cursor: 'pointer' }} />;
                          if (l.type === 'image')
                            return <div key={l.id} onClick={e => { e.stopPropagation(); setSelO(o.id); setSelL(l.id); }} style={{ ...st, background: `url(${l.imageUrl}) center/cover`, cursor: 'pointer' }} />;
                          return (
                            <div key={l.id} onClick={e => { e.stopPropagation(); setSelO(o.id); setSelL(l.id); }} style={{ ...st, background: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
                              {l.placeholder}
                            </div>
                          );
                        })}
                        <div className="pointer-events-none absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 font-mono text-[10px] text-white">{o.id}</div>
                      </div>
                    ))}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-purple-500/20" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-purple-500/20" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">0,0</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Page</div>
                <label className="text-xs text-zinc-400">page_id</label>
                <input value={page.id} onChange={e => setPage({ ...page, id: e.target.value.replace(/\s+/g, '_') })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm text-white" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="number" value={page.w} onChange={e => setPage({ ...page, w: Number(e.target.value) || 0 })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm text-white" placeholder="W" />
                  <input type="number" value={page.h} onChange={e => setPage({ ...page, h: Number(e.target.value) || 0 })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm text-white" placeholder="H" />
                </div>
                <label className="mt-2 block text-xs text-zinc-400">page_bg (r,g,b)</label>
                <input value={page.bg} onChange={e => setPage({ ...page, bg: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm text-white" />
              </div>
              {selObj && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Object — <span className="text-purple-300">{selObj.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400">W</label>
                      <input type="number" value={selObj.w} onChange={e => updO(selObj.id, { w: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400">H</label>
                      <input type="number" value={selObj.h} onChange={e => updO(selObj.id, { h: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
                    </div>
                  </div>
                  <label className="mt-2 block text-xs text-zinc-400">Position x,y (cartesian)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="range" min={-600} max={600} value={selObj.x} onChange={e => updO(selObj.id, { x: Number(e.target.value) })} className="accent-purple-500" />
                    <input type="range" min={-400} max={400} value={selObj.y} onChange={e => updO(selObj.id, { y: Number(e.target.value) })} className="accent-purple-500" />
                  </div>
                  <div className="flex justify-between font-mono text-xs text-zinc-400">
                    <span>x:{selObj.x}</span>
                    <span>y:{selObj.y}</span>
                  </div>
                  <label className="mt-2 block text-xs text-zinc-400">Scaling hr, wr (0,0=fill)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={selObj.hr.join(',')} onChange={e => { const v = e.target.value.split(',').map(Number); updO(selObj.id, { hr: [v[0] || 0, v[1] || 0] }); }} placeholder="0,0" className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white" />
                    <input value={selObj.wr.join(',')} onChange={e => { const v = e.target.value.split(',').map(Number); updO(selObj.id, { wr: [v[0] || 0, v[1] || 0] }); }} placeholder="0,0" className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white" />
                  </div>
                </div>
              )}
              {selLay && selObj && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Layer — <span className="text-sky-300">{selLay.id}</span>
                  </div>
                  <label className="text-xs text-zinc-400">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="range" min={-200} max={200} value={selLay.x} onChange={e => updL(selObj.id, selLay.id, { x: Number(e.target.value) })} className="accent-sky-500" />
                    <input type="range" min={-150} max={150} value={selLay.y} onChange={e => updL(selObj.id, selLay.id, { y: Number(e.target.value) })} className="accent-sky-500" />
                  </div>
                  {selLay.type === 'text' && (
                    <>
                      <label className="mt-2 block text-xs text-zinc-400">Text</label>
                      <input value={selLay.text || ''} onChange={e => updL(selObj.id, selLay.id, { text: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-zinc-400">Size</label>
                          <input type="number" value={selLay.fontSize || 16} onChange={e => updL(selObj.id, selLay.id, { fontSize: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
                        </div>
                        <label className="mt-6 flex items-center gap-2 text-xs text-zinc-300">
                          <input type="checkbox" checked={!!selLay.bold} onChange={e => updL(selObj.id, selLay.id, { bold: e.target.checked })} /> Bold
                        </label>
                      </div>
                    </>
                  )}
                  {selLay.type === 'input' && (
                    <>
                      <label className="mt-2 block text-xs text-zinc-400">Placeholder</label>
                      <input value={selLay.placeholder || ''} onChange={e => updL(selObj.id, selLay.id, { placeholder: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white" />
                    </>
                  )}
                  <label className="mt-2 block text-xs text-zinc-400">Colour (r,g,b)</label>
                  <input value={selLay.colour} onChange={e => updL(selObj.id, selLay.id, { colour: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-sm text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'scaling' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_380px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Scaling className="h-4 w-4 text-purple-400" /> Ratio-based Scaling
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Each object has <span className="font-mono text-pink-300">hr [top,bottom]</span> and <span className="font-mono text-sky-300">wr [left,right]</span>. <span className="font-mono text-emerald-300">[0,0]</span> = fill on that axis. Same as <span className="font-mono">page._apply_scaling()</span>.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: 'mobile', w: '≤480' },
                    { k: 'tablet', w: '≤768' },
                    { k: 'desktop', w: '≤1200' },
                  ].map(b => (
                    <div key={b.k} className={`rounded-lg border px-3 py-2 text-center ${brk === b.k ? 'border-white bg-white text-black' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                      <div className="text-xs font-bold uppercase">{b.k}</div>
                      <div className="font-mono text-xs">{b.w}px</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0f0f14] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Live preview</span>
                  <span className="font-mono text-xs text-zinc-500">
                    {vp}px • scale {sc.toFixed(3)} • {brk}
                  </span>
                </div>
                <input type="range" min={320} max={1400} value={vp} onChange={e => setVp(Number(e.target.value))} className="w-full accent-purple-500" />
                <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-white p-2">
                  <div className="overflow-hidden rounded-md border border-zinc-200" style={{ height: 260 }}>
                    <div className="relative bg-white" style={{ width: page.w, height: 260, transform: `scale(${vp / page.w})`, transformOrigin: 'top left' }}>
                      <div className="flex h-full items-center justify-around gap-2 p-4">
                        {objs.map(o => {
                          const fw = o.wr[0] === 0 && o.wr[1] === 0;
                          const fh = o.hr[0] === 0 && o.hr[1] === 0;
                          return (
                            <div key={o.id} className="flex flex-col items-center justify-center rounded-lg border-2 p-3 text-center" style={{ width: fw ? 140 : 120, height: fh ? 200 : 120, background: o.bg ? `rgb(${o.bg})` : '#f8fafc', borderColor: fw || fh ? '#10b981' : '#e2e8f0' }}>
                              <div className="font-mono text-[11px] font-bold text-zinc-700">{o.id}</div>
                              <div className="font-mono text-[10px] text-zinc-500">
                                {o.w}×{o.h}
                              </div>
                              <div className="mt-1 rounded bg-black px-1 py-0.5 font-mono text-[9px] text-white">hr [{o.hr.join(',')}]</div>
                              <div className="rounded bg-black px-1 py-0.5 font-mono text-[9px] text-white">wr [{o.wr.join(',')}]</div>
                              {(fw || fh) && <div className="mt-1 text-[9px] font-bold text-emerald-600">FILL</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Page size</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={page.w} onChange={e => setPage({ ...page, w: Number(e.target.value) || 0 })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white" />
                  <input type="number" value={page.h} onChange={e => setPage({ ...page, h: Number(e.target.value) || 0 })} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white" />
                </div>
              </div>
              {objs.map(o => (
                <div key={o.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-white">{o.id}</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {o.w}×{o.h}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-400">hr [top,bottom]</label>
                      <input value={o.hr.join(',')} onChange={e => { const v = e.target.value.split(',').map(Number); updO(o.id, { hr: [v[0] || 0, v[1] || 0] }); }} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400">wr [left,right]</label>
                      <input value={o.wr.join(',')} onChange={e => { const v = e.target.value.split(',').map(Number); updO(o.id, { wr: [v[0] || 0, v[1] || 0] }); }} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-xs text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'backend' && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_380px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Pre-built processes — click to add</div>
                {[
                  { t: 'Logic', items: ['function', 'conditional', 'loop', 'boolean'] as BlockType[] },
                  { t: 'API', items: ['api_call', 'api_make', 'collect'] as BlockType[] },
                  { t: 'Database', items: ['db_create', 'db_insert', 'db_find', 'db_update', 'db_delete'] as BlockType[] },
                  { t: 'Auth', items: ['auth_signup', 'auth_login', 'auth_oauth'] as BlockType[] },
                ].map(sec => (
                  <div key={sec.t}>
                    <div className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{sec.t}</div>
                    <div className="grid gap-1">
                      {sec.items.map(k => {
                        const d = BLOCK_DEFS[k];
                        return (
                          <button key={k} onClick={() => addB(k)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ background: d.color }}>
                              {d.icon}
                            </span>
                            <span className="text-sm text-zinc-200">{d.label}</span>
                            <Plus className="ml-auto h-3.5 w-3.5 text-zinc-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex gap-2">
                  <button onClick={play} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white">
                    <Play className="h-4 w-4" /> Play
                  </button>
                  <button onClick={() => { setBlocks([]); setOut(''); }} className="rounded-lg bg-white/10 px-3 py-2 text-zinc-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">Blocks connect top → bottom, or via link. Click link icon to connect.</p>
              </div>
            </div>
            <div className="min-w-0">
              <div className="rounded-xl border border-white/10 bg-[#0f0f14] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Chain — top → bottom</span>
                  <span className="font-mono text-xs text-zinc-500">{blocks.length} blocks</span>
                </div>
                {blocks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-12 text-center">
                    <Blocks className="mx-auto h-8 w-8 text-zinc-600" />
                    <div className="mt-2 text-sm text-zinc-400">No blocks yet</div>
                    <div className="text-xs text-zinc-500">Add from palette</div>
                  </div>
                ) : (
                  <div className="relative space-y-2">
                    <div className="pointer-events-none absolute bottom-6 left-5 top-6 w-0.5 bg-gradient-to-b from-purple-500/60 to-emerald-500/60" />
                    {blocks.map((b, i) => {
                      const d = BLOCK_DEFS[b.type];
                      const isSelected = selB === b.id;
                      const isConnectSource = connectFrom === b.id;
                      const target = b.next ? blocks.find(x => x.id === b.next) : null;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelB(b.id)}
                          className={`relative flex gap-3 rounded-xl border p-3 cursor-pointer ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'} ${isConnectSource ? 'ring-2 ring-amber-400/50' : ''}`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: d.color }}>
                            {d.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{i + 1}. {d.label}</span>
                              <span className={`h-2 w-2 rounded-full ${b.enabled ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              <span className="font-mono text-[11px] text-zinc-500">{b.type}</span>
                            </div>
                            <div className="truncate font-mono text-[11px] text-zinc-400">
                              {Object.entries(b.config).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`).join(' • ') || <span className="italic text-zinc-600">no config — select to edit →</span>}
                            </div>
                            {target && <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">→ {BLOCK_DEFS[target.type].label}</div>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (connectFrom === b.id) setConnectFrom(null);
                                else if (connectFrom) connectBlocks(connectFrom, b.id);
                                else setConnectFrom(b.id);
                              }}
                              className={`rounded p-1.5 ${connectFrom === b.id ? 'bg-amber-400 text-black' : 'bg-white/10 text-zinc-400'}`}
                              title="Link"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const idx = blocks.findIndex(x => x.id === b.id);
                                if (idx > 0) {
                                  const a = [...blocks];
                                  const [m] = a.splice(idx, 1);
                                  a.splice(idx - 1, 0, m);
                                  setBlocks(a);
                                }
                              }}
                              className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-zinc-300"
                            >
                              ↑
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const idx = blocks.findIndex(x => x.id === b.id);
                                if (idx < blocks.length - 1) {
                                  const a = [...blocks];
                                  const [m] = a.splice(idx, 1);
                                  a.splice(idx + 1, 0, m);
                                  setBlocks(a);
                                }
                              }}
                              className="rounded bg-white/10 px-1.5 py-1 text-[11px] text-zinc-300"
                            >
                              ↓
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setBlocks(v => v.filter(x => x.id !== b.id));
                                if (selB === b.id) setSelB(null);
                              }}
                              className="rounded p-1.5 text-zinc-500 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {connectFrom && <div className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">Select target block’s link icon to connect from {blocks.find(b => b.id === connectFrom)?.type} → …</div>}
                {out && (
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="mb-1 text-xs font-semibold text-emerald-300">Simulated output</div>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300">{out}</pre>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {selB ? (
                (() => {
                  const b = blocks.find(x => x.id === selB);
                  if (!b) return null;
                  const d = BLOCK_DEFS[b.type];
                  return (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: d.color }}>
                          {d.icon}
                        </span>
                        <span className="text-sm font-semibold text-white">{d.label}</span>
                        <label className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400">
                          <input type="checkbox" checked={b.enabled} onChange={e => setBlocks(v => v.map(x => (x.id === b.id ? { ...x, enabled: e.target.checked } : x)))} />
                          enabled
                        </label>
                      </div>
                      <div className="grid gap-2">
                        {d.fields.map(f => (
                          <div key={f.key}>
                            <label className="text-xs text-zinc-400">{f.key}</label>
                            <input value={b.config[f.key] || ''} onChange={e => setBlocks(v => v.map(x => (x.id === b.id ? { ...x, config: { ...x.config, [f.key]: e.target.value } } : x)))} placeholder={f.ph} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm text-white placeholder:text-zinc-600" />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setSelB(null)} className="flex-1 rounded-lg bg-white py-1.5 text-sm font-semibold text-black">
                          Done
                        </button>
                        <button onClick={() => setBlocks(v => v.filter(x => x.id !== b.id))} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-300">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-xs text-zinc-500">Select a block to edit its config.</div>
              )}
              <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Backend code</span>
                  <button onClick={() => copy(bCode)} className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black">
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="max-h-[380px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">{bCode}</pre>
              </div>
            </div>
          </div>
        )}

        {tab === 'pipeline' && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-300">
                  <Layers className="h-4 w-4" /> Frontend
                </div>
                <div className="text-xs text-white/60">Page + Objects + Layers • cartesian 0,0</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {objs.map(o => (
                    <span key={o.id} className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-300">
                      {o.id}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <Workflow className="h-4 w-4" /> Backend Blocks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {blocks.length === 0 ? <span className="text-xs text-white/40">No blocks — add in Backend tab</span> : blocks.map(b => <span key={b.id} className="rounded-full px-2 py-1 text-xs font-medium text-white" style={{ background: BLOCK_DEFS[b.type].color }}>{BLOCK_DEFS[b.type].label}</span>)}
                </div>
                <div className="mt-2 text-xs text-white/40">Connect via link icon or order top→bottom</div>
              </Card>
              <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-blue-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-300">
                  <Database className="h-4 w-4" /> Database
                </div>
                <div className="font-mono text-xs text-white/60">crescent.db.insert / find / update</div>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-xs text-sky-300">contacts</span>
                  <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-xs text-sky-300">users</span>
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden border-white/10 bg-black/20">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <GitBranch className="h-4 w-4 text-violet-400" /> Fullstack Flow
                </h3>
                <Button size="sm" variant="outline" onClick={() => copy(fullCode)} className="h-7 border-white/10 text-xs">
                  {copied ? <Check className="mr-1 h-3 w-3 text-emerald-400" /> : <Copy className="mr-1 h-3 w-3" />} Copy full app
                </Button>
              </div>
              <div className="overflow-auto bg-[#0f0f14] p-4">
                <div className="flex min-w-max items-center gap-2">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-6 text-center">
                    <Layers className="mb-1 h-5 w-5 text-violet-400" />
                    <div className="text-xs font-semibold text-violet-200">Frontend</div>
                    <div className="font-mono text-[11px] text-violet-300/70">form inputs</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-white/20" />
                  {blocks.map(b => (
                    <div key={b.id} className="flex items-center gap-2">
                      <div className="flex flex-col items-center justify-center rounded-xl px-5 py-4 text-center text-white" style={{ background: BLOCK_DEFS[b.type].color }}>
                        <div className="text-sm font-bold">{BLOCK_DEFS[b.type].icon}</div>
                        <div className="text-xs font-semibold">{BLOCK_DEFS[b.type].label}</div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-white/20" />
                    </div>
                  ))}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-6 text-center">
                    <Database className="mb-1 h-5 w-5 text-emerald-400" />
                    <div className="text-xs font-semibold text-emerald-200">DB Response</div>
                    <div className="font-mono text-xs text-emerald-300/70">201 / JSON</div>
                  </div>
                </div>
              </div>
              <div className="grid lg:grid-cols-2">
                <div className="border-b border-white/5 p-4 lg:border-b-0 lg:border-r">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/70">
                    <Play className="h-3 w-3" /> Try it — fill & submit (simulated)
                  </div>
                  <form onSubmit={runPipeline} className="space-y-2">
                    <input name="name" placeholder="Name" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/30 focus:border-violet-500 focus:outline-none" />
                    <input name="email" placeholder="Email" type="email" required className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/30 focus:border-violet-500 focus:outline-none" />
                    <input name="contact" placeholder="Contact (optional)" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/30 focus:border-violet-500 focus:outline-none" />
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500">
                      <Play className="mr-2 h-4 w-4" /> Run Pipeline (frontend → blocks → db)
                    </Button>
                  </form>
                  <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-emerald-300">{pipelineResult || 'Submit to see simulated crescent.db result…'}</pre>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                      <Code2 className="h-3.5 w-3.5" /> Full app code — crescent-js only
                    </span>
                    <button onClick={() => copy(fullCode)} className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Copy
                    </button>
                  </div>
                  <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">{fullCode}</pre>
                </div>
              </div>
            </Card>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link href="/docs/frontend" className="text-violet-400 hover:underline">
                Frontend docs →
              </Link>
              <Link href="/docs/examples" className="text-white/40 hover:text-white">
                Examples
              </Link>
            </div>
          </div>
        )}
      </div>

      {showCode && tab === 'frontend' && (
        <div className="mx-auto max-w-[1600px] px-4 pb-6 sm:px-6">
          <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Generated Crescent.js — copy to app.js</span>
              <button onClick={() => copy(fCode)} className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">{fCode}</pre>
          </div>
        </div>
      )}
      {showCode && tab === 'scaling' && (
        <div className="mx-auto max-w-[1600px] px-4 pb-6 sm:px-6">
          <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
            <div className="mb-2 text-xs font-semibold text-zinc-400">Scaling code</div>
            <pre className="font-mono text-xs text-zinc-300">{`const page = crescent.page({ page_id: '${page.id}', size: { height: ${page.h}, width: ${page.w} } });\n${objs.map(o => `page.set_scaling_ratio('${o.id}', [${o.hr.join(',')}], [${o.wr.join(',')}]);`).join('\n')}\nconst responsive = crescent.responsive({ page });\nresponsive.init();`}</pre>
          </div>
        </div>
      )}
      {showCode && tab === 'backend' && (
        <div className="mx-auto max-w-[1600px] px-4 pb-6 sm:px-6">
          <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
            <div className="mb-2 text-xs font-semibold text-zinc-400">Backend code — copy to app.js</div>
            <pre className="font-mono text-xs text-zinc-300">{bCode}</pre>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-xs text-zinc-500">All code is <span className="font-semibold text-white">Crescent.js only</span> — Next.js is just the shell. Copy any snippet to <span className="font-mono text-white">app.js</span> and run <span className="font-mono text-white">node app.js</span> or <span className="font-mono text-white">crescent run app.js</span>.</div>
      </div>
    </div>
  );
}
