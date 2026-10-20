import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { registrationConsentSchema } from '@/lib/registration-consent';

export async function POST(req: Request) {
  try {
    const parsed = registrationConsentSchema.extend({
      email: z.email().trim().toLowerCase(), password: z.string().min(6).max(72), nickname: z.string().trim().min(1).max(40),
    }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ message: '가입 정보를 확인하고 만 14세 이상 확인과 필수 동의를 완료해주세요.' }, { status: 400 });
    const { email, password, nickname } = parsed.data;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { message: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // Check if nickname already exists
    const existingNickname = await prisma.user.findFirst({
      where: { nickname },
    });

    if (existingNickname) {
      return NextResponse.json(
        { message: '이미 사용 중인 닉네임입니다.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: nickname,
        nickname,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', user: { email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
