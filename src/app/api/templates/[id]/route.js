import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request, { params }) {
  const { id } = await params;
  try {
    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
