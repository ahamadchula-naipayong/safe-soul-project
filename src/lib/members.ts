import fs from 'fs';
import path from 'path';
import { Member, TierType } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'members.json');

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
    console.error('Error saving members data:', error);
    throw error;
  }
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
 * Register a new member with incremental sequence number
 */
export function registerMember(params: {
  username: string;
  email: string;
  password: string;
  name?: string;
  tier?: TierType;
}): { success: boolean; member?: Member; error?: string } {
  const { username, email, password, name, tier = 'free_tier_1' } = params;

  if (!username || !password || !email) {
    return { success: false, error: 'กรุณากรอกชื่อผู้ใช้, อีเมล, และรหัสผ่านให้ครบถ้วน' };
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  // Check if username or email already exists
  const existing = findMember(cleanUsername) || findMember(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ หรือใช้ชื่ออื่น',
    };
  }

  const members = getAllMembers();
  const nextNumber = getNextMemberNumber();

  const newMember: Member = {
    id: `mem_${String(nextNumber).padStart(3, '0')}`,
    memberNumber: nextNumber,
    username: cleanUsername,
    email: cleanEmail,
    password: password.trim(),
    name: name?.trim() || cleanUsername,
    tier,
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveMembers(members);

  return { success: true, member: newMember };
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
