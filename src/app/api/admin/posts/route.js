import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const isValidToken = (token) =>
  Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;

export async function GET(request) {
  const token = request.nextUrl.searchParams.get('token');
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { date: 'desc' },
    include: { _count: { select: { photos: true } } },
  });

  return NextResponse.json({ success: true, posts });
}
