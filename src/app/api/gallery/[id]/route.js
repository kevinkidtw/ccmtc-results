import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { photos: { orderBy: { id: 'asc' } } },
    });

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: post.id,
      school: post.school,
      subject: post.subject,
      teacher: post.teacher,
      photos: post.photos.map(p => p.url),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
