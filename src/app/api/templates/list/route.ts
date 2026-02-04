import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');

    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ templates: [] });
    }

    const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.json'));
    
    const templates = files.map(file => {
      try {
        const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error(`Erro ao ler template ${file}:`, e);
        return null;
      }
    }).filter(t => t !== null);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return NextResponse.json({ error: 'Erro ao listar templates' }, { status: 500 });
  }
}
