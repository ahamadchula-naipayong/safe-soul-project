'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  KeyRound,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderSync,
  Github,
  Bot,
  User,
  Zap,
  X,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface ParsedAction {
  type: 'upsert_store_product' | 'update_article_override' | 'update_member' | 'update_contact_status';
  label?: string;
  data: Record<string, any>;
}

interface GeminiCoAdminWidgetProps {
  onActionSuccess?: () => void;
}

const STORAGE_KEY_API = 'fitrah_gemini_api_key';
const STORAGE_KEY_MODEL = 'fitrah_gemini_model';

const QUICK_PROMPTS = [
  {
    label: '📊 สรุปสถานะเว็บ & สลิปรอตรวจ',
    prompt: 'ช่วยสรุปภาพรวมสมาชิกทั้งหมด รายการที่รอตรวจสลิป สินค้าในร้านค้า และข้อความติดต่อใหม่ให้หน่อย',
  },
  {
    label: '🛍️ เพิ่มสินค้าใหม่ลงร้านค้า',
    prompt:
      'ช่วยสร้างสินค้าใหม่ใน Safe for Support ชื่อ "สมุดบันทึกเรขาคณิตศักดิ์สิทธิ์ (Sacred Geometry Journal)" ราคา 490 บาท (จากปกติ 690 บาท) สต็อก 50 เล่ม สถานะ draft พร้อมคำอธิบายตามโทนแบรนด์',
  },
  {
    label: '✍️ เกลาบทความทะเลน้ำตื้นเกาะที่ 1',
    prompt:
      'ช่วยร่างคำโปรย (excerpt) ใหม่สำหรับบทความรหัส shallow-1 ให้ลุ่มลึก สงบ และชวนตั้งคำถามตามหลัก Sacred Rationality พร้อมสร้างปุ่มบันทึกทับ',
  },
  {
    label: '👑 ตั้งสมาชิกเป็น Co-Admin',
    prompt:
      'ช่วยตรวจสอบรายชื่อสมาชิกในระบบ แล้วสร้างคำสั่งแต่งตั้งสมาชิกหมายเลข 2 (mem_002) ให้มีสิทธิ์ role เป็น co-admin',
  },
  {
    label: '📬 ตรวจข้อความติดต่อ & ร่างคำตอบ',
    prompt: 'มีข้อความติดต่อเรา (Contact Inbox) รายการไหนบ้าง ช่วยสรุปและร่างคำตอบที่สุภาพนอบน้อมให้หน่อย',
  },
];

function extractActionsFromContent(content: string): { cleanText: string; actions: ParsedAction[] } {
  const actions: ParsedAction[] = [];
  const regex = /```co-admin-action\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && parsed.type && parsed.data) {
        actions.push(parsed);
      }
    } catch (e) {
      console.warn('Could not parse co-admin-action block:', e);
    }
  }

  const cleanText = content.replace(/```co-admin-action\s*[\s\S]*?```/g, '').trim();
  return { cleanText, actions };
}

export function GeminiCoAdminWidget({ onActionSuccess }: GeminiCoAdminWidgetProps) {
  const [apiKey, setApiKey] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [hasServerKey, setHasServerKey] = useState(false);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'apikey' | 'gem_prompt'>('apikey');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [copiedGemPrompt, setCopiedGemPrompt] = useState(false);

  const [driveUrl, setDriveUrl] = useState('');
  const [isFetchingDrive, setIsFetchingDrive] = useState(false);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executingIdx, setExecutingIdx] = useState<string | null>(null);
  const [executedResults, setExecutedResults] = useState<Record<string, string>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'สลามและสวัสดีครับ ผมคือ **Fitrah Shield Gemini Co-Admin** ผู้ช่วยดูแลและปรับแต่งเว็บไซต์หลังบ้านของคุณ\n\nคุณสามารถสั่งให้ผม **เพิ่ม/แก้ไขสินค้า Safe for Support**, **เกลาและอัปเดตบทความ**, **ตรวจสลิป/ตั้งสิทธิ์ Co-Admin**, หรือ **วางลิงก์ Google Docs / Sheets จาก Google Drive** เพื่อนำเข้าข้อมูลลงฐานข้อมูลเว็บไซต์ได้ทันทีครับ',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY_API) || '';
      const savedModel = localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-3.8-flash';
      if (savedKey) {
        setApiKey(savedKey);
        setTempKey(savedKey);
      }
      setSelectedModel(
        savedModel.startsWith('gemini-2.') ? 'gemini-3.8-flash' : savedModel
      );
    } catch {
      // ignore storage errors
    }

    fetch('/api/admin/co-admin', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.hasServerKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => null);
  }, []);

  const isConnected = Boolean(apiKey.trim() || hasServerKey);

  const openGoogleAIStudioPopup = () => {
    const width = 980;
    const height = 720;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(
      'https://aistudio.google.com/apikey',
      'GoogleAIStudioLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleTestAndSaveKey = async () => {
    const clean = tempKey.trim();
    if (!clean) {
      setKeyTestResult({ ok: false, msg: 'กรุณาวาง Gemini API Key (ขึ้นต้นด้วย AIza...)' });
      return;
    }

    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const res = await fetch('/api/admin/co-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_key',
          apiKey: clean,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setKeyTestResult({
          ok: false,
          msg: data.error || 'API Key ไม่ถูกต้อง หรือไม่สามารถเชื่อมต่อได้',
        });
      } else {
        setApiKey(clean);
        localStorage.setItem(STORAGE_KEY_API, clean);
        localStorage.setItem(STORAGE_KEY_MODEL, selectedModel);
        setKeyTestResult({
          ok: true,
          msg: `เชื่อมต่อสำเร็จด้วยโมเดล ${data.modelUsed}! (${data.message})`,
        });
      }
    } catch (err: any) {
      setKeyTestResult({
        ok: false,
        msg: err?.message || 'เกิดข้อผิดพลาดในการทดสอบ API Key',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    setTempKey('');
    setKeyTestResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY_API);
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/admin/co-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          apiKey: apiKey.trim(),
          model: selectedModel,
          message: textToSend,
          driveUrl: driveUrl.trim() || undefined,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyContent = data.success
        ? data.reply
        : `❌ **เกิดข้อผิดพลาด:** ${data.error || 'ไม่สามารถประมวลผลคำสั่งได้'}\n\nกรุณาตรวจสอบ Gemini API Key โดยคลิกที่ปุ่ม **"🔑 ตั้งค่า / ล็อกอินรับ Gemini API (ฟรี)"** ด้านบน`;

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `❌ ไม่สามารถติดต่อเซิร์ฟเวอร์ Co-Admin ได้: ${err?.message || 'Network Error'}`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDriveLink = async () => {
    const cleanUrl = driveUrl.trim();
    if (!cleanUrl) return;

    setIsFetchingDrive(true);
    try {
      const res = await fetch('/api/admin/co-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_drive_doc',
          driveUrl: cleanUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `drive-err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **ไม่สามารถดึงไฟล์จากลิงก์ Google Drive นี้ได้:**\n${data.error}\n\n*วิธีแก้:* เปิดไฟล์ใน Google Drive / Docs / Sheets กดปุ่ม **Share (แชร์)** มุมขวาบน แล้วเปลี่ยนเป็น **"Anyone with the link (ทุกคนที่มีลิงก์อ่านได้)"** จากนั้นลองกดดึงอีกครั้งครับ`,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        await handleSendMessage(
          `ช่วยอ่านเนื้อหาจากไฟล์ ${data.sourceType} ลิงก์นี้ (${cleanUrl}) แล้วสรุปประเด็นสำคัญ พร้อมแปลงเป็นร่างบทความหรือรายการสินค้าที่พร้อมบันทึกลงเว็บไซต์ให้หน่อย`
        );
        setDriveUrl('');
      }
    } finally {
      setIsFetchingDrive(false);
    }
  };

  const handleExecuteAction = async (actionKey: string, action: ParsedAction) => {
    setExecutingIdx(actionKey);
    try {
      const res = await fetch('/api/admin/co-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_action',
          executePayload: action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExecutedResults((prev) => ({
          ...prev,
          [actionKey]: `✅ ${data.message}`,
        }));
        if (onActionSuccess) onActionSuccess();
      } else {
        setExecutedResults((prev) => ({
          ...prev,
          [actionKey]: `❌ ${data.error || 'ดำเนินการไม่สำเร็จ'}`,
        }));
      }
    } catch (err: any) {
      setExecutedResults((prev) => ({
        ...prev,
        [actionKey]: `❌ เกิดข้อผิดพลาด: ${err?.message || 'Error'}`,
      }));
    } finally {
      setExecutingIdx(null);
    }
  };

  const gemPromptText = `คุณคือ "Fitrah Shield Co-Admin" ผู้ช่วยดูแลและพัฒนาเว็บไซต์ The Fitrah Shield / Safe Soul Project (https://thefitrahshield.hardynaipayong.cloud)
- เรียกใช้ @Google Drive และ @GitHub (Repo: ahamadchula-naipayong/safe-soul-project) เสมอ
- โทนเสียง: สงบ ลุ่มลึก นอบน้อม ชัดเจนด้วยเหตุผล (Sacred Rationality)
- โครงสร้างข้อมูลหลัก:
  1) บทความน้ำตื้น: Assets/SAFE oneshot chapter/
  2) บทความน้ำลึก: Assets/SAFE deep ocean/
  3) ข่าววิเคราะห์: Assets/News Deepdive.xlsx
  4) ข้อมูลเว็บไซต์: data/ocean_articles_override.json, data/store_products.json, data/members.json`;

  return (
    <div className="luxury-glass rounded-3xl border-2 border-gold-warm/60 overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#0F291E] via-[#133325] to-[#0B1D15] px-6 py-5 border-b border-gold-warm/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-warm uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-gold-warm animate-pulse" />
            <span>GEMINI AI CO-ADMIN • GOOGLE DRIVE &amp; GITHUB PIPELINE</span>
            <span
              className={`ml-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isConnected
                  ? 'bg-emerald-950/90 border-emerald-400/50 text-emerald-300'
                  : 'bg-amber-950/90 border-amber-400/50 text-amber-300'
              }`}
            >
              {isConnected ? `● เชื่อมต่อแล้ว (${selectedModel})` : '○ รอเชื่อมต่อ API Key ฟรี'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-thai-serif font-bold text-parchment-cream">
            ผู้ช่วยดูแลและปรับแต่งเว็บไซต์อัจฉริยะ (Gemini Co-Admin Console)
          </h2>
          <p className="text-xs text-parchment-muted font-light">
            สั่งงานด้วยภาษาไทยเพื่อแก้ไขบทความ เพิ่มสินค้า ตรวจสลิป แต่งตั้ง Co-Admin หรือดึงไฟล์จาก Google Drive มาอัปเดตลงฐานข้อมูล Cloudflare D1 ในคลิกเดียว (ใช้โควตาฟรี 0 บาท)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setModalTab('apikey');
              setIsKeyModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-2 shadow-gold-sm cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isConnected ? 'ตั้งค่า Gemini API / โมเดล' : '🔑 ล็อกอิน / รับ Gemini API ฟรี (Popup)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalTab('gem_prompt');
              setIsKeyModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Github className="w-4 h-4 text-gold-warm" />
            <span>คำสั่ง Gem &amp; GitHub Pipeline</span>
          </button>
        </div>
      </div>

      {/* Google Drive / Docs / Sheets Quick Sync Bar */}
      <div className="bg-black/40 px-6 py-3.5 border-b border-emerald-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 shrink-0">
          <FolderSync className="w-4 h-4 text-cyan-400" />
          <span>ซิงค์ไฟล์จาก Google Drive / Docs / Sheets:</span>
        </div>
        <input
          type="url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          placeholder="วางลิงก์ Google Docs, Google Sheets หรือไฟล์ใน Google Drive ที่แชร์ลิงก์ไว้..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-emerald-border focus:border-gold-warm text-xs text-parchment-cream placeholder:text-parchment-muted/50 outline-none"
        />
        <button
          type="button"
          disabled={!driveUrl.trim() || isFetchingDrive}
          onClick={handleImportDriveLink}
          className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 disabled:opacity-40 border border-cyan-400/50 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
        >
          {isFetchingDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          <span>ดึงเนื้อหาเข้า Co-Admin</span>
        </button>
      </div>

      {/* Quick Prompt Buttons */}
      <div className="px-6 py-3 bg-[#09150F]/80 border-b border-emerald-border/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-gold-warm font-bold shrink-0">คำสั่งด่วน:</span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-3 py-1.5 rounded-full bg-emerald-card/80 hover:bg-emerald-surface border border-gold-warm/30 text-[11px] text-parchment-cream whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto bg-[#07110C]/90">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const { cleanText, actions } = isUser
            ? { cleanText: msg.content, actions: [] }
            : extractActionsFromContent(msg.content);

          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-gold-warm/20 border-gold-warm text-gold-light'
                    : 'bg-emerald-surface border-gold-warm/40 text-gold-warm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-3xl rounded-2xl p-4 space-y-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gold-warm/15 border border-gold-warm/40 text-parchment-cream'
                    : 'bg-emerald-card/70 border border-emerald-border text-parchment-cream'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-parchment-muted border-b border-white/10 pb-1.5">
                  <span className="font-bold text-gold-light">
                    {isUser ? 'คุณ (Admin)' : 'Fitrah Shield Gemini Co-Admin'}
                  </span>
                  <span>
                    {msg.modelUsed ? `${msg.modelUsed} • ` : ''}
                    {msg.timestamp}
                  </span>
                </div>

                <div className="whitespace-pre-wrap font-light">{cleanText}</div>

                {/* Executable Action Cards */}
                {actions.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {actions.map((act, aIdx) => {
                      const actionKey = `${msg.id}-act-${aIdx}`;
                      const executedMsg = executedResults[actionKey];
                      const isExecuting = executingIdx === actionKey;

                      return (
                        <div
                          key={actionKey}
                          className="p-3.5 rounded-xl bg-black/60 border border-gold-warm/50 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-light">
                              <Zap className="w-4 h-4 text-gold-warm" />
                              <span>{act.label || `คำสั่งอัปเดตระบบ (${act.type})`}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              {act.type}
                            </span>
                          </div>

                          <pre className="text-[11px] font-mono text-parchment-muted bg-black/50 p-2.5 rounded-lg overflow-x-auto max-h-36">
                            {JSON.stringify(act.data, null, 2)}
                          </pre>

                          {executedMsg ? (
                            <div className="text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-400/40 px-3 py-2 rounded-lg">
                              {executedMsg}
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isExecuting}
                              onClick={() => handleExecuteAction(actionKey, act)}
                              className="w-full py-2.5 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center justify-center gap-2 shadow-gold-sm cursor-pointer"
                            >
                              {isExecuting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>กำลังบันทึกลงฐานข้อมูล...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>⚡ ยืนยันดำเนินการและบันทึกลงเว็บไซต์ทันที</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-gold-light px-2">
            <Loader2 className="w-4 h-4 animate-spin text-gold-warm" />
            <span>Gemini Co-Admin กำลังวิเคราะห์ข้อมูลเว็บไซต์และเตรียมคำสั่ง...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-[#0B1A13] border-t border-gold-warm/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำสั่งให้ Gemini Co-Admin ช่วยจัดการเว็บ เช่น 'เพิ่มสินค้าใหม่...', 'เกลาบทความ...', 'สรุปสมาชิกที่รอตรวจสลิป'..."
          className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-emerald-border focus:border-gold-warm text-xs sm:text-sm text-parchment-cream placeholder:text-parchment-muted/50 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 rounded-xl gold-bevel-button disabled:opacity-40 text-slate-abyss font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-gold-sm shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>ส่งคำสั่ง Co-Admin</span>
        </button>
      </form>

      {/* POPUP MODAL: Google AI Studio Login & API Key Setup / Gem Prompt */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-gradient-to-b from-[#11271C] via-[#0B1912] to-[#060E0A] border-2 border-gold-warm/70 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gold-warm/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gold-warm/20 border border-gold-warm flex items-center justify-center text-gold-light">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-thai-serif font-bold text-parchment-cream">
                    เชื่อมต่อระบบ Gemini Co-Admin (ฟรี 0 บาท)
                  </h3>
                  <p className="text-xs text-parchment-muted">
                    ล็อกอินด้วยบัญชี Google เพื่อรับ API Key ฟรีจาก Google AI Studio หรือคัดลอกคำสั่ง Gem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/15 flex items-center justify-center text-parchment-muted hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-4 flex gap-2 border-b border-emerald-border/50">
              <button
                type="button"
                onClick={() => setModalTab('apikey')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer ${
                  modalTab === 'apikey'
                    ? 'bg-gold-warm/20 text-gold-light border-t border-x border-gold-warm/50'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                🔑 1. ล็อกอินรับ &amp; ตั้งค่า Gemini API Key (ฟรี)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('gem_prompt')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer ${
                  modalTab === 'gem_prompt'
                    ? 'bg-gold-warm/20 text-gold-light border-t border-x border-gold-warm/50'
                    : 'text-parchment-muted hover:text-parchment-cream'
                }`}
              >
                🤖 2. คำสั่งสร้าง Gem บนเว็บ gemini.google.com
              </button>
            </div>

            {modalTab === 'apikey' ? (
              <div className="p-6 space-y-5 text-xs sm:text-sm">
                {/* Step 1: Popup Login Button */}
                <div className="p-4 rounded-2xl bg-black/50 border border-gold-warm/40 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-gold-light flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-gold-warm" />
                        <span>ขั้นตอนที่ 1: เปิดหน้าต่าง Pop-up ล็อกอิน Google AI Studio</span>
                      </div>
                      <p className="text-xs text-parchment-muted leading-relaxed">
                        คลิกปุ่มด้านล่างเพื่อเปิดหน้าต่างล็อกอินของ Google AI Studio จากนั้นกดปุ่ม{' '}
                        <strong className="text-parchment-cream">&ldquo;Create API key&rdquo;</strong> แล้วคัดลอกรหัสคีย์มาวางในช่องด้านล่าง (ใช้งานฟรี ไม่ต้องผูกบัตร)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openGoogleAIStudioPopup}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-950 via-emerald-950 to-cyan-950 hover:from-cyan-900 hover:to-emerald-900 border border-cyan-400/60 text-cyan-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-300" />
                    <span>เปิดหน้าต่าง Pop-up ล็อกอิน Google AI Studio (รับ API Key ฟรี)</span>
                  </button>
                </div>

                {/* Step 2: Paste Key & Choose Model */}
                <div className="space-y-3">
                  <label className="block font-bold text-parchment-cream text-xs">
                    ขั้นตอนที่ 2: วางรหัส Gemini API Key ของคุณที่นี่
                  </label>
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3 rounded-xl bg-black/70 border border-emerald-border focus:border-gold-warm text-parchment-cream font-mono text-xs outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-parchment-muted mb-1">
                        เลือกรุ่นโมเดล Gemini (3.8 Flash ฟรี / 4.0 เรือธง):
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-emerald-border text-xs text-parchment-cream outline-none"
                      >
                        <optgroup label="🟢 โควตาฟรี 100% (Free Tier แนะนำ)">
                          <option value="gemini-3.8-flash">Gemini 3.8 Flash (แนะนำ • ฉลาดสุดใน Free Tier)</option>
                          <option value="gemini-3.6-flash">Gemini 3.6 Flash (เสถียรและแม่นยำ • ฟรี)</option>
                          <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (ความเร็วสูงสุด 1M • ฟรี)</option>
                          <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (ประหยัดโควตาสูงสุด • ฟรี)</option>
                          <option value="gemma-4-31b-it">Gemma 4 31B Instruct (โอเพนโมเดลรุ่น 4.0 • ฟรี)</option>
                        </optgroup>
                        <optgroup label="👑 ตระกูล Gemini 4.0 เรือธง (ต้องผูก Billing / Paid Tier)">
                          <option value="gemini-4-hydrogen">Gemini 4.0 Hydrogen (1M • สมดุลความเร็วและเหตุผล)</option>
                          <option value="gemini-4-argon">Gemini 4.0 Argon (1M • เรือธง Reasoning เชิงลึก)</option>
                          <option value="gemini-4-carbon">Gemini 4.0 Carbon (1M • สูงสุดด้านวิศวกรรมและตรรกะ)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        disabled={isTestingKey}
                        onClick={handleTestAndSaveKey}
                        className="flex-1 py-2.5 px-4 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center justify-center gap-1.5 shadow-gold-sm cursor-pointer"
                      >
                        {isTestingKey ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>กำลังทดสอบคีย์...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ทดสอบ &amp; บันทึก API Key</span>
                          </>
                        )}
                      </button>

                      {apiKey && (
                        <button
                          type="button"
                          onClick={handleClearKey}
                          className="py-2.5 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-400/40 text-red-200 text-xs font-semibold cursor-pointer"
                        >
                          ลบคีย์
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {keyTestResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      keyTestResult.ok
                        ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200'
                        : 'bg-red-950/80 border-red-400/50 text-red-200'
                    }`}
                  >
                    {keyTestResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {keyTestResult.ok ? 'เชื่อมต่อสำเร็จ!' : 'เชื่อมต่อไม่สำเร็จ'}
                      </div>
                      <div>{keyTestResult.msg}</div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-parchment-muted">
                  <span>🔒 รหัสคีย์ถูกเก็บไว้ในเบราว์เซอร์ของคุณและใช้เชื่อมต่อกับ Google Gemini API โดยตรง</span>
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-card hover:bg-emerald-surface text-parchment-cream font-semibold cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4 text-xs">
                <p className="text-parchment-muted leading-relaxed">
                  นอกจากใช้ Gemini Co-Admin ในหน้าเว็บนี้แล้ว คุณยังสามารถคัดลอกคำสั่งด้านล่างไปสร้าง{' '}
                  <strong className="text-gold-light">Gem บนหน้าเว็บ gemini.google.com</strong> เพื่อเชื่อมต่อกับ{' '}
                  <strong className="text-cyan-300">@Google Drive</strong> และ{' '}
                  <strong className="text-emerald-300">@GitHub</strong> ได้อีกด้วย:
                </p>

                <pre className="p-4 rounded-2xl bg-black/70 border border-emerald-border text-parchment-cream font-mono text-[11px] whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {gemPromptText}
                </pre>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(gemPromptText);
                      setCopiedGemPrompt(true);
                      setTimeout(() => setCopiedGemPrompt(false), 2500);
                    }}
                    className="px-4 py-2.5 rounded-xl gold-bevel-button text-slate-abyss font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedGemPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedGemPrompt ? 'คัดลอกคำสั่ง Gem แล้ว!' : 'คัดลอกคำสั่งสำหรับสร้าง Gem'}</span>
                  </button>

                  <a
                    href="https://gemini.google.com/gems/create"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-card hover:bg-emerald-surface border border-gold-warm/40 text-gold-light font-semibold text-xs flex items-center gap-1.5"
                  >
                    <span>เปิดหน้าสร้าง Gem (gemini.google.com)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
