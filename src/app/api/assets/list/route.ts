import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'backgrounds';
    
    // Caminho base dos assets
    const assetsDir = path.join(process.cwd(), 'public', 'assets', folder);

    // Se a pasta não existir, retorna lista vazia
    if (!fs.existsSync(assetsDir)) {
      return NextResponse.json({ files: [] });
    }

    // Lê os arquivos da pasta
    const files = fs.readdirSync(assetsDir).filter(file => {
      // Filtra apenas imagens e vídeos
      return /\.(mp4|mov|webm|png|jpg|jpeg|webp|gif)$/i.test(file);
    });

    // Mapeia para URL pública
    const fileList = files.map(file => ({
      name: file,
      url: `/assets/${folder}/${file}`,
      type: /\.(mp4|mov|webm)$/i.test(file) ? 'video' : 'image'
    }));

    return NextResponse.json({ files: fileList });

  } catch (error) {
    console.error('Erro ao listar assets:', error);
    return NextResponse.json(
      { error: 'Erro ao listar arquivos' },
      { status: 500 }
    );
  }
}
