import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        subject: true
      },
      distinct: ['subject']
    });

    const subjects = posts.map(p => p.subject).filter(Boolean);

    return NextResponse.json({ success: true, subjects });
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json({ success: false, subjects: [] }, { status: 500 });
  }
}
