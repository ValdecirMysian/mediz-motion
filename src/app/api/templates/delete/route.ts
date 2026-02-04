import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do template não fornecido' }, { status: 400 });
    }

    const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '');
    const templatePath = path.join(process.cwd(), 'public', 'templates', `${safeId}.json`);
    const thumbnailPath = path.join(process.cwd(), 'public', 'thumbnails', `${safeId}.jpg`);

    let deleted = false;

    // Deleta JSON
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
      deleted = true;
    }

    // Deleta Thumbnail (se existir)
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar template' }, { status: 500 });
  }
}
