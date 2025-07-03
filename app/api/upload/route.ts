import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST запрос для загрузки изображений
export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const path = join(uploadDir, filename);
  
  try {
    // Убедимся, что директория для загрузки существует
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path, buffer);
    
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}

// GET запрос для получения списка загруженных файлов (опционально)
export async function GET(request: NextRequest) {
  try {
    // Получаем информацию о пользователе из middleware
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Доступ запрещен - требуется роль администратора' },
        { status: 403 }
      );
    }

    const { readdir } = await import('fs/promises');
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] }, { status: 200 });
    }

    const files = await readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    const fileList = imageFiles.map(file => ({
      name: file,
      url: `/uploads/${file}`,
      uploadedAt: new Date().toISOString() // В реальном проекте нужно хранить метаданные
    }));

    return NextResponse.json({ files: fileList }, { status: 200 });

  } catch (error: any) {
    console.error('Ошибка при получении списка файлов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка файлов', details: error.message },
      { status: 500 }
    );
  }
} 