import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: { name, email }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const prismaError = error as PrismaClientKnownRequestError;
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}