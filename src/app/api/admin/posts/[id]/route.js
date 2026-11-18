import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const isValidToken = (token) =>
  Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;

export async function GET(request, { params }) {
  const token = request.nextUrl.searchParams.get('token');
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, post });
}

export async function PUT(request, { params }) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token, ...fields } = body;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.update({
    where: { id },
    data: {
      date: new Date(fields.date),
      school: fields.school,
      gradeLevel: fields.gradeLevel,
      teacher: fields.teacher,
      subject: fields.subject,
      content: fields.content,
      category: fields.category || null,
      infoTechDetails: fields.infoTechDetails || null,
      lifeTechDetails: fields.lifeTechDetails || null,
      policyFocus: fields.policyFocus || null,
    },
  });

  return NextResponse.json({ success: true, post });
}

export async function DELETE(request, { params }) {
  const token = request.nextUrl.searchParams.get('token');
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // 刪除磁碟上的照片資料夾
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', id);
  try {
    await fs.rm(uploadDir, { recursive: true, force: true });
  } catch {
    // 資料夾不存在也沒關係
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
