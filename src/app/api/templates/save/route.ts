import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

// Cache do bundle em memória (funciona bem em VPS/Container persistente)
let cachedBundleLocation: string | null = null;

export async function POST(req: NextRequest) {
  try {
    const template = await req.json();
    
    if (!template.id || !template.nome) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Garante que o ID seja seguro para nome de arquivo
    const safeId = template.id.replace(/[^a-zA-Z0-9-_]/g, '');
    const fileName = `${safeId}.json`;
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
    const filePath = path.join(templatesDir, fileName);

    // Garante que diretórios existam
    if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
    if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

    // ========================================================================
    // GERAÇÃO DE THUMBNAIL (Server-Side)
    // ========================================================================
    console.log('📸 Gerando thumbnail para:', template.nome);

    try {
      // 1. Bundle (se ainda não existir)
      if (!cachedBundleLocation) {
        console.log('📦 Bundling Remotion...');
        const entryPoint = path.join(process.cwd(), 'src/remotion/index.ts');
        cachedBundleLocation = await bundle({
          entryPoint,
          webpackOverride: (config) => config, // Necessário para Next.js
        });
      }

      // 2. Prepara Dados Mockados para o Preview
      // Conta quantos produtos o template espera
      const productLayers = template.camadas.filter((c: any) => c.tipo === 'produto-preco' || c.tipo === 'preco');
      const mockDados = {
        produtos: productLayers.map((_: any, i: number) => ({
          imagem: '', // Deixa vazio para usar o fallback colorido do componente
          nome: `Produto ${i + 1}`,
          preco: '99,90'
        })),
        whatsapp: '(45) 9999-9999',
        localizacao: 'Localização Exemplo'
      };

      // 3. Seleciona Composição
      const composition = await selectComposition({
        serveUrl: cachedBundleLocation,
        id: 'MedizMotionTeste', // ID definido no Root.tsx
        inputProps: { template, dados: mockDados },
      });

      // 4. Renderiza Frame Estático (1.5s = 45 frames @ 30fps para pegar animações já iniciadas)
      const thumbnailPath = path.join(thumbnailsDir, `${safeId}.jpg`);
      
      await renderStill({
        composition,
        serveUrl: cachedBundleLocation,
        output: thumbnailPath,
        frame: 45, 
        imageFormat: 'jpeg',
        inputProps: {
          template,
          dados: mockDados,
        },
      });

      console.log('✅ Thumbnail gerada:', thumbnailPath);
      
      // Adiciona URL da thumbnail ao template
      template.thumbnail = `/thumbnails/${safeId}.jpg`;

    } catch (renderError) {
      console.error('⚠️ Falha ao gerar thumbnail (salvando sem):', renderError);
      // Não impede o salvamento do JSON, apenas loga o erro
    }

    // ========================================================================
    // SALVAR JSON
    // ========================================================================

    // Salva o arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2));

    return NextResponse.json({ 
      success: true, 
      fileName,
      thumbnail: template.thumbnail 
    });

  } catch (error) {
    console.error('Erro ao salvar template:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar template' }, { status: 500 });
  }
}
