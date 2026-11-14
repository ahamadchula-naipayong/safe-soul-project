import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import {
  getAllMembers,
  saveMembers,
  registerMember,
  updateMember,
  deleteMember,
  getNextMemberNumber,
} from '@/lib/members';
import { Member, TierType, PaymentStatus } from '@/types';

export const dynamic = 'force-dynamic';

function tierToCategoryName(tier: TierType): string {
  switch (tier) {
    case 'founding_tier_3':
      return 'เรือสำราญทุกมรสุม (Founding 100)';
    case 'supporter_tier_2':
      return 'เรือประมงน้ำลึก (Supporter)';
    default:
      return 'เรือประมงน้ำตื้น (Free Tier)';
  }
}

function parseCategoryToTier(val: string): TierType {
  const s = (val || '').toLowerCase();
  if (s.includes('founding') || s.includes('สำราญ') || s.includes('tier_3') || s.includes('3')) {
    return 'founding_tier_3';
  }
  if (s.includes('supporter') || s.includes('น้ำลึก') || s.includes('tier_2') || s.includes('2')) {
    return 'supporter_tier_2';
  }
  return 'free_tier_1';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('export'); // 'xlsx' | 'csv' | null
    const category = searchParams.get('category') || 'all';

    let members = getAllMembers().sort((a, b) => a.memberNumber - b.memberNumber);

    if (category && category !== 'all') {
      if (category === 'pending_slip') {
        members = members.filter((m) => m.paymentStatus === 'pending_verification');
      } else {
        members = members.filter((m) => m.tier === category);
      }
    }

    // Export as Excel (.xlsx) or CSV (.csv)
    if (exportType === 'xlsx' || exportType === 'csv') {
      const exportRows = members.map((m) => ({
        Member_No: m.memberNumber,
        ID: m.id,
        Username: m.username,
        FullName: m.name,
        Phone: m.phone || '',
        Email: m.email,
        Category: tierToCategoryName(m.tier),
        Tier_Code: m.tier,
        Payment_Status: m.paymentStatus || (m.tier === 'free_tier_1' ? 'free' : 'verified'),
        Amount_THB: m.paymentAmount ?? 0,
        Billing_Cycle: m.billingCycle || '',
        Slip_URL: m.paymentSlipUrl || '',
        Admin_Notes: m.notes || '',
        Created_At: m.createdAt,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = [
        { wch: 11 },
        { wch: 11 },
        { wch: 18 },
        { wch: 26 },
        { wch: 16 },
        { wch: 28 },
        { wch: 32 },
        { wch: 18 },
        { wch: 20 },
        { wch: 13 },
        { wch: 14 },
        { wch: 32 },
        { wch: 28 },
        { wch: 24 },
      ];

      if (exportType === 'csv') {
        const csvContent = '\uFEFF' + XLSX.utils.sheet_to_csv(worksheet);
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="fitrah-shield-members-${category}.csv"`,
          },
        });
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="fitrah-shield-members-${category}.xlsx"`,
        },
      });
    }

    const allMembers = getAllMembers();
    return NextResponse.json({
      success: true,
      total: allMembers.length,
      counts: {
        all: allMembers.length,
        free_tier_1: allMembers.filter((m) => m.tier === 'free_tier_1').length,
        supporter_tier_2: allMembers.filter((m) => m.tier === 'supporter_tier_2').length,
        founding_tier_3: allMembers.filter((m) => m.tier === 'founding_tier_3').length,
        pending_slip: allMembers.filter((m) => m.paymentStatus === 'pending_verification').length,
      },
      items: members,
    });
  } catch (error) {
    console.error('GET /api/admin/members error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถโหลดข้อมูลตารางสมาชิกได้' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Case A: Bulk Import / Sync from Excel or CSV rows
    if (body.action === 'import_rows' && Array.isArray(body.rows)) {
      const existingMembers = getAllMembers();
      let updatedCount = 0;
      let createdCount = 0;

      for (const row of body.rows) {
        const id = String(row.ID || row.id || '').trim();
        const username = String(row.Username || row.username || '').trim();
        const email = String(row.Email || row.email || '').trim();
        if (!username && !email && !id) continue;

        const name = String(row.FullName || row.name || username).trim();
        const phone = String(row.Phone || row.phone || '').trim();
        const tierRaw = String(row.Tier_Code || row.Category || row.tier || 'free_tier_1');
        const tier = parseCategoryToTier(tierRaw);
        const paymentStatus = (row.Payment_Status ||
          row.paymentStatus ||
          (tier === 'free_tier_1' ? 'free' : 'verified')) as PaymentStatus;
        const paymentAmount = Number(row.Amount_THB ?? row.paymentAmount ?? 0) || 0;
        const notes = String(row.Admin_Notes || row.notes || '').trim();

        const matchIdx = existingMembers.findIndex(
          (m) =>
            (id && m.id === id) ||
            (username && m.username.toLowerCase() === username.toLowerCase()) ||
            (email && m.email.toLowerCase() === email.toLowerCase())
        );

        if (matchIdx !== -1) {
          existingMembers[matchIdx] = {
            ...existingMembers[matchIdx],
            name: name || existingMembers[matchIdx].name,
            phone,
            email: email || existingMembers[matchIdx].email,
            tier,
            paymentStatus,
            paymentAmount,
            notes,
            updatedAt: new Date().toISOString(),
          };
          updatedCount++;
        } else if (username && email) {
          const nextNum =
            existingMembers.length === 0
              ? getNextMemberNumber()
              : Math.max(...existingMembers.map((m) => m.memberNumber || 0)) + 1;

          const newMember: Member = {
            id: `mem_${String(nextNum).padStart(3, '0')}`,
            memberNumber: nextNum,
            username,
            email,
            phone,
            password: String(row.password || 'password123'),
            name: name || username,
            tier,
            paymentStatus,
            paymentAmount,
            billingCycle:
              tier === 'founding_tier_3'
                ? 'lifetime'
                : tier === 'supporter_tier_2'
                ? 'monthly'
                : 'free',
            notes,
            createdAt: new Date().toISOString(),
          };
          existingMembers.push(newMember);
          createdCount++;
        }
      }

      saveMembers(existingMembers);
      return NextResponse.json({
        success: true,
        updatedCount,
        createdCount,
        message: `นำเข้าข้อมูลสำเร็จ: อัปเดต ${updatedCount} รายการ, เพิ่มใหม่ ${createdCount} รายการ`,
      });
    }

    // Case B: Create single member by Admin
    const result = registerMember({
      username: body.username,
      email: body.email,
      phone: body.phone || '',
      password: body.password || 'password123',
      name: body.name,
      tier: body.tier || 'free_tier_1',
      role: body.role || 'member',
      paymentStatus: body.paymentStatus,
      paymentAmount: body.paymentAmount,
      billingCycle: body.billingCycle,
      notes: body.notes,
      isAdminOverride: true,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, member: result.member });
  } catch (error) {
    console.error('POST /api/admin/members error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสมาชิก' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสสมาชิก' }, { status: 400 });
    }

    const result = updateMember(id, updates);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, member: result.member });
  } catch (error) {
    console.error('PATCH /api/admin/members error:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถแก้ไขข้อมูลสมาชิกได้' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสสมาชิก' }, { status: 400 });
    }

    const deleted = deleteMember(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'ไม่พบสมาชิกที่ต้องการลบ' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/members error:', error);
    return NextResponse.json({ success: false, error: 'ลบข้อมูลสมาชิกไม่สำเร็จ' }, { status: 500 });
  }
}
