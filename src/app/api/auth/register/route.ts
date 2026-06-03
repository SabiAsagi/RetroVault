import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, nickname } = await req.json();

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
