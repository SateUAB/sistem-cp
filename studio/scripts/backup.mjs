#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioRoot = path.resolve(__dirname, '..');
const backupsDir = path.join(studioRoot, 'backups');

// Garante que a pasta de backups exista
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Cria timestamp legivel: AAAA-MM-DD_HH-mm-ss
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

const dataset = process.env.SANITY_DATASET || 'production';
const filename = `backup-${dataset}-${timestamp}.tar.gz`;
const outputPath = path.join(backupsDir, filename);

console.log('====================================================');
console.log('📦 INICIANDO BACKUP DO SANITY DATASET');
console.log(`Dataset: ${dataset}`);
console.log(`Destino: ${outputPath}`);
console.log('====================================================\n');

try {
    // Executa a exportacao oficial do Sanity CLI (inclui documentos e midias/assets)
    execSync(`npx sanity dataset export ${dataset} "${outputPath}"`, {
        cwd: studioRoot,
        stdio: 'inherit'
    });

    console.log('\n====================================================');
    console.log('✅ BACKUP CONCLUIDO COM SUCESSO!');
    console.log(`Arquivo gerado: ${filename}`);
    console.log(`Caminho completo: ${outputPath}`);
    console.log('----------------------------------------------------');
    console.log('💡 INSTRUCOES DE SEGURANCA E RESTAURACAO:');
    console.log('1. Guarde este arquivo em local seguro (ex: Google Drive, OneDrive ou HD externo).');
    console.log('2. Para restaurar este backup a qualquer momento no Sanity, execute:');
    console.log(`   npx sanity dataset import "${outputPath}" ${dataset} --replace`);
    console.log('====================================================\n');
} catch (error) {
    console.error('\n❌ Erro durante a exportacao do backup:');
    console.error(error.message);
    console.error('\n⚠️ Dica: se for um erro de autenticacao, faca login no Sanity rodando:');
    console.error('   npx sanity login\n');
    process.exit(1);
}
