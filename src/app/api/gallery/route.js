import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { date: 'desc' },
      include: {
        photos: { orderBy: { id: 'asc' } },
      },
    });

    const gallery = posts.map(post => {
      const coverUrl = post.photos[0]?.url ?? null;
      return {
        id: post.id,
        school: post.school,
        subject: post.subject,
        teacher: post.teacher,
        date: post.date,
        photoCount: post.photos.length,
        coverPhoto: coverUrl,
        photos: post.photos.map(p => p.url),
      };
    });

    return NextResponse.json(gallery, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
