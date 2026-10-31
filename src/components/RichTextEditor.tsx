'use client';

import React, { useState, useRef } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Sparkles,
  Eye,
  Edit3,
  Columns,
  Undo2,
  Redo2,
  Code,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  isDeepMode?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'เขียนเนื้อหาบทความด้วย Markdown หรือใช้แถบเครื่องมือด้านบน...',
  minHeight = '320px',
  isDeepMode = false,
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Update with undo/redo history tracking
  const updateContent = (newVal: string) => {
    onChange(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Helper to wrap selected text or insert prefix
  const wrapSelection = (prefix: string, suffix: string = '', defaultText: string = 'ข้อความ') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = before + replacement + after;
    updateContent(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Insert block or line prefix
  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = value.substring(0, start);
    const after = value.substring(start);

    // If not at start of line, add newline
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    const insertStr = (needsNewline ? '\n' : '') + prefix + ' ';
    const nextVal = before + insertStr + after;
    updateContent(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertStr.length, start + insertStr.length);
    }, 10);
  };

  // Insert Google Sheets / Docs Style Table
  const insertTable = () => {
    const tableTemplate = `\n| มิติการพิจารณา | มุมมองดุนยา (วัตถุนิยม) | มุมมองแสงแห่งปัญญา (สัจธรรม) |\n| :--- | :--- | :--- |\n| **เป้าหมายสูงสุด** | การสะสมทรัพย์สินและชื่อเสียง | การใช้ทรัพย์เป็นสะพานสร้างคุณค่า |\n| **สภาวะจิตใจ** | ความกลัวสูญเสียและเปรียบเทียบ | ความสงบนิ่งและพึงพอใจในตน |\n| **ผลลัพธ์ระยะยาว** | ความว่างเปล่าทางจิตวิญญาณ | มรดกคุณธรรมอันยั่งยืนนิรันดร์ |\n\n`;
    insertRawSnippet(tableTemplate);
  };

  // Insert Raw Snippet at cursor
  const insertRawSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const nextVal = before + snippet + after;
    updateContent(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  // Insert Template Blocks
  const applyTemplate = (type: 'reflection' | 'epistemic' | 'callout') => {
    setIsTemplateMenuOpen(false);
    if (type === 'reflection') {
      insertRawSnippet(`\n> ### 💡 บันทึกการใคร่ครวญ (Sanctuary Reflection)\n> "เมื่อคุณตื่นเช้าขึ้นมาในโลกดิจิทัล อะไรคือสิ่งแรกที่เรียกร้องความสนใจของคุณ และคุณจะรักษาดุลยภาพของหัวใจไว้อย่างไร?"\n\n`);
    } else if (type === 'epistemic') {
      insertRawSnippet(`\n### ✦ กรอบญาณวิทยาและหลักฐานเชิงวิชาการ\n- **มิติตรรกศาสตร์ (Logic):** ตรรกะเชิงนิรนัย (Deductive Syllogism) ว่าด้วยความไม่เที่ยงแท้ของสสาร\n- **มิติจิตวิทยา (Psychology):** ปรากฏการณ์ Hedonic Treadmill และความเหนื่อยล้าทางดิจิทัล\n- **มิติเทววิทยา (Theology):** การใคร่ครวญผ่านอัลกุรอาน ซูเราะฮ์ อัล-ฮะดีด (57:20)\n\n`);
    } else if (type === 'callout') {
      insertRawSnippet(`\n> **ข้อคิดสำคัญ:** ทรัพย์สินและชื่อเสียงเปรียบเสมือนน้ำใต้ท้องเรือ มีไว้เพื่อพยุงให้เรือแล่นไปข้างหน้า อย่าปล่อยให้น้ำรั่วเข้ามาในเรือจนเรือจม\n\n`);
    }
  };

  // Handle Keyboard Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      wrapSelection('**', '**', 'ข้อความตัวหนา');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      wrapSelection('*', '*', 'ข้อความตัวเอียง');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      wrapSelection('[', '](https://example.com)', 'ข้อความลิงก์');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
    }
  };

  // Word & Character count
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-emerald-border/80 bg-[#0A1611] overflow-hidden shadow-xl font-thai">
      {/* Header Label & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0F241A] border-b border-emerald-border/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold-warm" />
          <span className="text-xs sm:text-sm font-thai-serif font-bold text-parchment-cream">
            {label || 'ตัวจัดรูปแบบเนื้อหาขั้นสูง (Rich Formatting & Markdown Engine)'}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            Google Docs / Sheets Tools
          </span>
        </div>

        {/* View Switcher: Edit / Split / Preview */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'edit'
                ? 'bg-gold-warm text-slate-abyss font-bold shadow-sm'
                : 'text-parchment-muted hover:text-parchment-cream'
            }`}
            title="เฉพาะช่องพิมพ์ (Editor Only)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">แก้ไข</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-gold-warm text-slate-abyss font-bold shadow-sm'
                : 'text-parchment-muted hover:text-parchment-cream'
            }`}
            title="แก้ไขพร้อมดูตัวอย่างข้างกัน (Split View)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>แบ่งจอ</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'preview'
                ? 'bg-gold-warm text-slate-abyss font-bold shadow-sm'
                : 'text-parchment-muted hover:text-parchment-cream'
            }`}
            title="ดูตัวอย่างจริง (Full Preview)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ตัวอย่าง</span>
          </button>
        </div>
      </div>

      {/* Google Docs-Style Toolbar */}
      <div className="p-2 sm:p-2.5 bg-[#0C1A13] border-b border-emerald-border/60 flex flex-wrap items-center gap-1 text-parchment-cream text-xs">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition text-parchment-muted hover:text-parchment-cream"
            title="เลิกทำ (Undo - Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition text-parchment-muted hover:text-parchment-cream"
            title="ทำซ้ำ (Redo - Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={() => insertLinePrefix('#')}
            className="px-2 py-1.5 rounded-lg hover:bg-white/10 font-bold text-xs text-gold-light hover:text-white transition flex items-center gap-1"
            title="หัวข้อหลัก H1 (# หัวข้อ)"
          >
            <Heading1 className="w-4 h-4" />
            <span className="hidden xl:inline">H1</span>
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('##')}
            className="px-2 py-1.5 rounded-lg hover:bg-white/10 font-bold text-xs text-gold-warm hover:text-white transition flex items-center gap-1"
            title="หัวข้อรอง H2 (## หัวข้อ)"
          >
            <Heading2 className="w-4 h-4" />
            <span className="hidden xl:inline">H2</span>
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('###')}
            className="px-2 py-1.5 rounded-lg hover:bg-white/10 font-bold text-xs text-amber-200 hover:text-white transition flex items-center gap-1"
            title="หัวข้อย่อย H3 (### หัวข้อ)"
          >
            <Heading3 className="w-4 h-4" />
            <span className="hidden xl:inline">H3</span>
          </button>
        </div>

        {/* Inline Formatting (B, I, U, S) */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'ข้อความตัวหนา')}
            className="p-1.5 rounded-lg hover:bg-white/10 font-bold transition text-parchment-cream hover:text-gold-light"
            title="ตัวหนา Bold (**ข้อความ** - Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'ข้อความตัวเอียง')}
            className="p-1.5 rounded-lg hover:bg-white/10 italic transition text-parchment-cream hover:text-gold-light"
            title="ตัวเอียง Italic (*ข้อความ* - Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<u>', '</u>', 'ข้อความขีดเส้นใต้')}
            className="p-1.5 rounded-lg hover:bg-white/10 underline transition text-parchment-cream hover:text-gold-light"
            title="ขีดเส้นใต้ (<u>ข้อความ</u>)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('~~', '~~', 'ข้อความขีดฆ่า')}
            className="p-1.5 rounded-lg hover:bg-white/10 line-through transition text-parchment-cream hover:text-gold-light"
            title="ขีดฆ่า Strikethrough (~~ข้อความ~~)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Color Highlight Dropper */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHighlightMenuOpen(!isHighlightMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              title="ไฮไลต์สีข้อความ (Highlight Color)"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {isHighlightMenuOpen && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-[#12251D] border border-gold-warm/40 rounded-xl shadow-2xl z-20 space-y-1.5 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => {
                    wrapSelection('<mark class="gold">', '</mark>', 'ไฮไลต์สีทองปัญญา');
                    setIsHighlightMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1 rounded bg-amber-500/20 text-gold-light text-xs hover:bg-amber-500/30 flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-warm" />
                  <span>ไฮไลต์ทองปัญญา</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    wrapSelection('<mark class="emerald">', '</mark>', 'ไฮไลต์สีมรกต');
                    setIsHighlightMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs hover:bg-emerald-500/30 flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>ไฮไลต์มรกตลึก</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    wrapSelection('<mark class="caramel">', '</mark>', 'ไฮไลต์คาราเมลโก๋ในซอย');
                    setIsHighlightMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1 rounded bg-[#AB682A]/20 text-[#E4A86E] text-xs hover:bg-[#AB682A]/30 flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#AB682A]" />
                  <span>ไฮไลต์คาราเมล</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={() => insertLinePrefix('')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-muted hover:text-white"
            title="จัดชิดซ้าย (Default Left Align)"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<div align="center">\n', '\n</div>', 'ข้อความกึ่งกลาง')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-muted hover:text-white"
            title="จัดกึ่งกลาง (Center Align)"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<div align="right">\n', '\n</div>', 'ข้อความชิดขวา')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-muted hover:text-white"
            title="จัดชิดขวา (Right Align)"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={() => insertLinePrefix('-')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="รายการแบบจุด Bullet List (- รายการ)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('1.')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="รายการแบบลำดับตัวเลข Numbered List (1. รายการ)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('- [ ]')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="เช็กลิสต์ Checklist (- [ ] สิ่งที่ต้องทำ)"
          >
            <ListTodo className="w-4 h-4" />
          </button>
        </div>

        {/* Google Sheets Style Table & Rich Inserters */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
          <button
            type="button"
            onClick={insertTable}
            className="px-2 py-1.5 rounded-lg bg-emerald-surface/80 hover:bg-emerald-light border border-gold-warm/30 text-gold-light font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            title="แทรกตารางข้อมูลคล้าย Google Sheets (Insert Markdown Table)"
          >
            <TableIcon className="w-4 h-4 text-gold-warm" />
            <span className="hidden sm:inline">แทรกตาราง</span>
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('>')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="กล่องข้อความอ้างอิง Quote / Callout (> ข้อความ)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('[', '](https://example.com)', 'ชื่อลิงก์')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="แทรกลิงก์ Link ([ข้อความ](url))"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('![', '](https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80)', 'คำอธิบายรูปภาพ')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="แทรกรูปภาพ Image (![คำอธิบาย](url))"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertLinePrefix('\n---\n')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="เส้นคั่นตอน Horizontal Rule (---)"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('```\n', '\n```', '// โค้ดหรือข้อความพิเศษ')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-parchment-cream hover:text-gold-light"
            title="บล็อกโค้ด Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Templates Dropdown */}
        <div className="relative pl-1">
          <button
            type="button"
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-gold-warm/20 hover:bg-gold-warm/30 border border-gold-warm/40 text-gold-light font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            title="แม่แบบบทความและกล่องข้อคิดพร้อมใช้"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-warm" />
            <span>แม่แบบสำเร็จรูป</span>
          </button>

          {isTemplateMenuOpen && (
            <div className="absolute top-full right-0 mt-1 p-2 bg-[#0F241A] border border-gold-warm/40 rounded-2xl shadow-2xl z-20 space-y-1.5 w-64">
              <div className="text-[11px] font-bold text-parchment-muted px-2 py-1 uppercase tracking-wider">
                เลือกแม่แบบใส่ในบทความ:
              </div>
              <button
                type="button"
                onClick={() => applyTemplate('reflection')}
                className="w-full text-left p-2 rounded-xl bg-black/40 hover:bg-emerald-surface text-xs text-parchment-cream hover:text-gold-light transition space-y-0.5"
              >
                <div className="font-bold flex items-center gap-1.5 text-gold-warm">
                  <span>💡 กล่องใคร่ครวญ (Reflection Box)</span>
                </div>
                <div className="text-[11px] text-parchment-muted font-light">
                  กล่องคำถามชวนคิดประจำสัปดาห์
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('epistemic')}
                className="w-full text-left p-2 rounded-xl bg-black/40 hover:bg-emerald-surface text-xs text-parchment-cream hover:text-gold-light transition space-y-0.5"
              >
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <span>✦ โครงสร้าง 4 มิติแห่งปัญญา</span>
                </div>
                <div className="text-[11px] text-parchment-muted font-light">
                  ตรรกะ, จิตวิทยา, วิทยาศาสตร์ & เทววิทยา
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('callout')}
                className="w-full text-left p-2 rounded-xl bg-black/40 hover:bg-emerald-surface text-xs text-parchment-cream hover:text-gold-light transition space-y-0.5"
              >
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <span>📌 กล่องเน้นใจความสำคัญ (Callout)</span>
                </div>
                <div className="text-[11px] text-parchment-muted font-light">
                  สรุปแก่นปัญหาสั้นกระชับ
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor & Preview Workspace Container */}
      <div className="relative">
        {/* EDIT ONLY MODE */}
        {viewMode === 'edit' && (
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{ minHeight }}
              className={`w-full p-4 rounded-xl bg-slate-dark/90 border border-emerald-border/60 focus:border-gold-warm text-sm sm:text-base text-parchment-cream outline-none leading-relaxed resize-y font-mono ${
                isDeepMode ? 'font-serif' : 'font-sans'
              }`}
            />
          </div>
        )}

        {/* SPLIT SCREEN MODE (Side-by-side Editor & Real-time Markdown Preview) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-emerald-border/60">
            {/* Left: Input Textarea */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-parchment-muted mb-2">
                <span>ช่องกรอกเนื้อหา Markdown:</span>
                <span>รองรับ Ctrl+B, Ctrl+I, Ctrl+K</span>
              </div>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => updateContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{ minHeight }}
                className={`w-full flex-1 p-4 rounded-xl bg-slate-dark/90 border border-emerald-border/60 focus:border-gold-warm text-sm text-parchment-cream outline-none leading-relaxed resize-y font-mono ${
                  isDeepMode ? 'font-serif' : 'font-sans'
                }`}
              />
            </div>

            {/* Right: Real-time Markdown Sanctuary Preview */}
            <div className="p-4 bg-[#08120E] overflow-y-auto max-h-[600px]">
              <div className="flex items-center justify-between text-[11px] text-gold-warm mb-3 pb-2 border-b border-emerald-border/40">
                <span className="flex items-center gap-1.5 font-bold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>ตัวอย่างการแสดงผลจริง (Sanctuary Live Preview)</span>
                </span>
                <span className="text-[10px] text-parchment-muted">
                  เหมือนที่ผู้อ่านจะเห็นบนหน้าเว็บ
                </span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-emerald-border/30">
                <MarkdownRenderer content={value} isDeepMode={isDeepMode} />
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW ONLY MODE */}
        {viewMode === 'preview' && (
          <div className="p-6 bg-[#08120E] overflow-y-auto max-h-[700px]">
            <div className="flex items-center justify-between text-xs text-gold-warm mb-4 pb-2 border-b border-emerald-border/40">
              <span className="font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>ตัวอย่างแสดงผลลัพธ์ฉบับเต็ม (Full Sanctuary Presentation)</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className="text-xs text-gold-light hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>กลับไปแก้ไข</span>
              </button>
            </div>
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-emerald-card/60 border border-emerald-border/60 shadow-2xl">
              <MarkdownRenderer content={value} isDeepMode={isDeepMode} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Word Count & Helper Tips */}
      <div className="px-4 py-2 bg-[#09150F] border-t border-emerald-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-parchment-muted font-mono">
        <div className="flex items-center gap-3">
          <span>ความยาว: <strong>{charCount}</strong> ตัวอักษร</span>
          <span>•</span>
          <span><strong>{wordCount}</strong> คำ</span>
          <span>•</span>
          <span className="text-emerald-400">Markdown + GFM Tables พร้อมใช้งาน</span>
        </div>

        <div className="flex items-center gap-1.5 text-gold-warm/80">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>เคล็ดลับ: สามารถลากแทรกตารางหรือคัดลอก Markdown มาวางได้ทันที</span>
        </div>
      </div>
    </div>
  );
}
