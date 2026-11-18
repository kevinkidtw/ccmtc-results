import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ success: false, templates: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, content, category } = body;

    if (!name || !content) {
      return NextResponse.json({ success: false, error: '缺少範本名稱或內容' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: { name, content, category: category || '其他' }
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
