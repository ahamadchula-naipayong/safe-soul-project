import fs from 'fs';
import path from 'path';
import { Member, TierType, PaymentStatus, MemberRole } from '@/types';
import { executeD1Query } from '@/lib/cloudflareD1';

const dataFilePath = path.join(process.cwd(), 'data', 'members.json');
const slipsDir = path.join(process.cwd(), 'public', 'uploads', 'slips');

/**
 * Save a base64 data URL image/PDF slip into public/uploads/slips and return its public URL
 */
export function saveUploadedSlip(base64DataUrl: string, memberNumber: number): string {
  if (!base64DataUrl) return '';
  // If already a URL path (not data:...), return as-is
  if (!base64DataUrl.startsWith('data:')) {
    return base64DataUrl;
  }

  try {
    if (!fs.existsSync(slipsDir)) {
      fs.mkdirSync(slipsDir, { recursive: true });
    }

    const match = base64DataUrl.match(/^data:([A-Za-z0-9/+.-]+);base64,(.+)$/);
    if (!match) return '';

    const mimeType = match[1];
    const base64Data = match[2];
    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('pdf')) ext = 'pdf';

    const filename = `slip-member-${memberNumber}-${Date.now()}.${ext}`;
    const fullPath = path.join(slipsDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(base64Data, 'base64'));

    return `/uploads/slips/${filename}`;
  } catch (error) {
    console.error('Error saving payment slip:', error);
    return '';
  }
}

/**
 * Read all members from data/members.json
 */
export function getAllMembers(): Member[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const members: Member[] = JSON.parse(raw);
    return members;
  } catch (error) {
    console.error('Error reading members data:', error);
    return [];
  }
}

/**
 * Save members list to data/members.json
 */
export function saveMembers(members: Member[]): void {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving members data locally:', error);
  }

  // Asynchronously mirror member records to Cloudflare D1 (fitrah-shield-db) when CLOUDFLARE_API_TOKEN is configured
  if (process.env.CLOUDFLARE_API_TOKEN) {
    Promise.all(
      members.map((m) =>
        executeD1Query(
          `INSERT OR REPLACE INTO members (id, member_number, username, email, phone, password, name, tier, role, payment_status, payment_slip_url, payment_amount, billing_cycle, ebook_claimed, ebook_claimed_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.memberNumber,
            m.username,
            m.email,
            m.phone || '',
            m.password || 'password123',
            m.name,
            m.tier,
            m.role || (m.memberNumber === 1 ? 'admin' : 'member'),
            m.paymentStatus || 'free',
            m.paymentSlipUrl || null,
            m.paymentAmount || 0,
            m.billingCycle || 'free',
            m.ebookClaimed ? 1 : 0,
            m.ebookClaimedAt || null,
            m.notes || '',
            m.createdAt,
            m.updatedAt || null,
          ]
        )
      )
    ).catch((err) => console.error('Cloudflare D1 member sync error:', err));
  }
}

/**
 * Find member by id
 */
export function findMemberById(id: string): Member | null {
  if (!id) return null;
  const members = getAllMembers();
  return members.find((m) => m.id === id) || null;
}

/**
 * Find member by username or email (case-insensitive)
 */
export function findMember(usernameOrEmail: string): Member | null {
  if (!usernameOrEmail) return null;
  const target = usernameOrEmail.trim().toLowerCase();
  const members = getAllMembers();
  return (
    members.find(
      (m) =>
        m.username.toLowerCase() === target ||
        m.email.toLowerCase() === target
    ) || null
  );
}

/**
 * Get next incremental member sequence number
 */
export function getNextMemberNumber(): number {
  const members = getAllMembers();
  if (members.length === 0) return 1;
  const maxNumber = Math.max(...members.map((m) => m.memberNumber || 0));
  return maxNumber + 1;
}

/**
 * Register a new member with incremental sequence number, phone, and optional QR slip
 */
export function registerMember(params: {
  username: string;
  email: string;
  phone?: string;
  password: string;
  name?: string;
  tier?: TierType;
  role?: MemberRole;
  paymentSlipDataUrl?: string;
  paymentAmount?: number;
  billingCycle?: 'free' | 'monthly' | 'yearly' | 'lifetime';
  paymentStatus?: PaymentStatus;
  notes?: string;
  isAdminOverride?: boolean;
}): { success: boolean; member?: Member; error?: string } {
  const {
    username,
    email,
    phone = '',
    password,
    name,
    tier = 'free_tier_1',
    role = 'member',
    paymentSlipDataUrl,
    paymentAmount,
    billingCycle,
    paymentStatus,
    notes,
    isAdminOverride = false,
  } = params;

  if (!username || !password || !email) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้, อีเมล, และรหัสผ่านให้ครบถ้วน' };
  }

  if (!isAdminOverride && !phone.trim()) {
    return { success: false, error: 'กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อและยืนยันสิทธิ์สมาชิก' };
  }

  const isPaidTier = tier === 'supporter_tier_2' || tier === 'founding_tier_3';
  if (isPaidTier && !isAdminOverride && !paymentSlipDataUrl) {
    return {
      success: false,
      error: 'กรุณาแนบไฟล์สลิปการโอนเงินเพื่อตรวจสอบสำหรับระดับสมาชิกที่เลือก',
    };
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  const existing = findMember(cleanUsername) || findMember(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ หรือใช้ชื่ออื่น',
    };
  }

  const members = getAllMembers();
  const nextNumber = getNextMemberNumber();

  let slipUrl = '';
  if (paymentSlipDataUrl) {
    slipUrl = saveUploadedSlip(paymentSlipDataUrl, nextNumber);
  }

  const defaultAmount =
    tier === 'founding_tier_3'
      ? 3990
      : tier === 'supporter_tier_2'
      ? billingCycle === 'yearly'
        ? 1990
        : 199
      : 0;

  const resolvedCycle =
    billingCycle ||
    (tier === 'founding_tier_3'
      ? 'lifetime'
      : tier === 'supporter_tier_2'
      ? 'monthly'
      : 'free');

  const resolvedPaymentStatus: PaymentStatus =
    paymentStatus ||
    (tier === 'free_tier_1' ? 'free' : isAdminOverride ? 'verified' : 'pending_verification');

  const newMember: Member = {
    id: `mem_${String(nextNumber).padStart(3, '0')}`,
    memberNumber: nextNumber,
    username: cleanUsername,
    email: cleanEmail,
    phone: phone.trim(),
    password: password.trim(),
    name: name?.trim() || cleanUsername,
    tier,
    role,
    paymentStatus: resolvedPaymentStatus,
    paymentSlipUrl: slipUrl || undefined,
    paymentAmount: paymentAmount !== undefined ? paymentAmount : defaultAmount,
    billingCycle: resolvedCycle,
    notes: notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveMembers(members);

  return { success: true, member: newMember };
}

/**
 * Update an existing member (used by Admin Member Table or Tier Upgrade)
 */
export function updateMember(
  id: string,
  updates: Partial<Member> & { paymentSlipDataUrl?: string }
): { success: boolean; member?: Member; error?: string } {
  const members = getAllMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) {
    return { success: false, error: 'ไม่พบข้อมูลสมาชิกในระบบ' };
  }

  const current = members[idx];
  let slipUrl = updates.paymentSlipUrl !== undefined ? updates.paymentSlipUrl : current.paymentSlipUrl;
  if (updates.paymentSlipDataUrl) {
    slipUrl = saveUploadedSlip(updates.paymentSlipDataUrl, current.memberNumber);
  }

  const { paymentSlipDataUrl: _, ...restUpdates } = updates;

  const updated: Member = {
    ...current,
    ...restUpdates,
    // Keep password if empty string passed during edit
    password:
      restUpdates.password && restUpdates.password.trim()
        ? restUpdates.password.trim()
        : current.password,
    paymentSlipUrl: slipUrl,
    updatedAt: new Date().toISOString(),
  };

  members[idx] = updated;
  saveMembers(members);

  return { success: true, member: updated };
}

/**
 * Delete member by ID
 */
export function deleteMember(id: string): boolean {
  const members = getAllMembers();
  const filtered = members.filter((m) => m.id !== id);
  if (filtered.length === members.length) return false;
  saveMembers(filtered);
  return true;
}

/**
 * Authenticate member by username/email and password
 */
export function authenticateMember(
  usernameOrEmail: string,
  password: string
): { success: boolean; member?: Member; error?: string } {
  if (!usernameOrEmail || !password) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' };
  }

  const member = findMember(usernameOrEmail);
  if (!member) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' };
  }

  if (member.password !== password.trim()) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
  }

  return { success: true, member };
}
