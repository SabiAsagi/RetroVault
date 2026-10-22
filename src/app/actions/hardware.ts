'use server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getHardware, type HardwareRecord } from '@/lib/hardware';
import { z } from 'zod';

const schema = z.object({
  catalogId: z.string().min(1).max(120).refine(id => Boolean(getHardware(id))),
  status: z.enum(['OWNED', 'WISHLIST']),
  quantity: z.number().int().min(1).max(99),
  memo: z.string().trim().max(2000),
}).strict();

export async function getHardwareCollection(): Promise<HardwareRecord[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const rows = await prisma.hardwareCollectionItem.findMany({
    where: { userId: session.user.id }, orderBy: { updatedAt: 'desc' },
    select: { catalogId: true, status: true, quantity: true, memo: true },
  });
  return rows.map(row => ({ ...row, status: row.status as HardwareRecord['status'] }));
}

export async function saveHardwareCollection(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: '로그인 후 기기를 담을 수 있어요.' };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: '기기·상태·수량·메모를 확인해주세요.' };
  const { catalogId, ...values } = parsed.data;
  try {
    await prisma.hardwareCollectionItem.upsert({
      where: { userId_catalogId: { userId: session.user.id, catalogId } },
      create: { userId: session.user.id, catalogId, ...values }, update: values,
    });
    revalidatePath('/collection');
    revalidatePath(`/hardware/${catalogId}`);
    return { ok: true };
  } catch { return { ok: false, error: '기록을 저장하지 못했어요. 잠시 후 다시 시도해주세요.' }; }
}

export async function removeHardwareCollection(catalogId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: '로그인이 필요해요.' };
  if (typeof catalogId !== 'string' || !getHardware(catalogId)) return { ok: false, error: '기기를 확인해주세요.' };
  try {
    await prisma.hardwareCollectionItem.deleteMany({ where: { userId: session.user.id, catalogId } });
    revalidatePath('/collection');
    revalidatePath(`/hardware/${catalogId}`);
    return { ok: true };
  } catch { return { ok: false, error: '기록을 지우지 못했어요. 잠시 후 다시 시도해주세요.' }; }
}
