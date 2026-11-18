import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const dateStr = formData.get('date');
    const school = formData.get('school');
    const gradeLevel = formData.get('gradeLevel');
    const classSubject = formData.get('subject');
    const content = formData.get('content') || '';
    const category = formData.get('category');
    const infoTechDetails = formData.get('infoTechDetails');
    const lifeTechDetails = formData.get('lifeTechDetails');
    const policyFocus = formData.get('policyFocus');
    const teacher = formData.get('teacher');
    const photos = formData.getAll('photos');

    // Validations
    if (content.length < 50) {
      return NextResponse.json({ success: false, error: '教學內容簡介必須至少 50 個字' }, { status: 400 });
    }
    if (photos.length < 4 || (photos.length === 1 && photos[0].name === '')) {
      return NextResponse.json({ success: false, error: '請上傳至少 4 張照片' }, { status: 400 });
    }

    // Create post in DB
    const post = await prisma.post.create({
      data: {
        date: new Date(dateStr),
        school,
        gradeLevel,
        subject: classSubject,
        content,
        category,
        infoTechDetails,
        lifeTechDetails,
        policyFocus,
        teacher
      }
    });

    // Save photos (process all before writing to DB)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', post.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const photoRecords = [];
    try {
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${i}.jpg`;
        const filePath = path.join(uploadDir, filename);

        // Compress to max 1600px wide, JPEG quality 82
        // Falls back to writing original if sharp can't handle the format (e.g. HEIC without heif support)
        try {
          await sharp(buffer)
            .rotate()
            .resize(1600, null, { withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toFile(filePath);
        } catch {
          await fs.writeFile(filePath, buffer);
        }

        const fileUrl = `/api/images/${post.id}/${filename}`;
        photoRecords.push({ url: fileUrl, postId: post.id });
      }
    } catch (photoErr) {
      // Clean up orphaned DB record and uploaded files on failure
      await prisma.post.delete({ where: { id: post.id } }).catch(() => {});
      await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
      throw photoErr;
    }

    if (photoRecords.length > 0) {
      await prisma.photo.createMany({ data: photoRecords });
    }

    return NextResponse.json({ success: true, postId: post.id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
