import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function run(cmd, desc) {
  console.log(`\n⏳ ${desc}...`);
  try {
    const output = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });
    if (output.trim()) console.log(output.trim());
    return { ok: true, output };
  } catch (err) {
    console.error(`❌ Ошибка на этапе: ${desc}`);
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    return { ok: false, error: err };
  }
}

async function main() {
  console.log('====================================================');
  console.log('🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ GEMOLO / HAEMOHELP В БОЙ');
  console.log('====================================================');

  // 1. Проверка локальной сборки перед отправкой
  const buildRes = run('npm run build', '1. Проверка продакшн-сборки (Next.js Turbopack)');
  if (!buildRes.ok) {
    console.error('\n❌ Сборка завершилась с ошибкой. Деплой отменён, чтобы не сломать прод.');
    process.exit(1);
  }

  // 2. Добавление всех измененных файлов
  run('git add .', '2. Подготовка файлов (git add .)');

  // 3. Коммит
  const customMessage = process.argv.slice(2).join(' ');
  const timestamp = new Date().toLocaleString('ru-RU');
  const commitMsg = customMessage ? `update: ${customMessage}` : `deploy: automated update ${timestamp}`;

  const statusRes = run('git status --porcelain', 'Проверка изменений');
  if (statusRes.output && statusRes.output.trim()) {
    run(`git commit -m "${commitMsg}"`, `3. Создание коммита: "${commitMsg}"`);
  } else {
    console.log('ℹ️ Нет новых изменений для коммита, отправляем текущее состояние.');
  }

  // 4. Отправка в ветки main и master на GitHub
  const pushMain = run('git push origin main', '4. Отправка в GitHub (origin/main)');
  const pushMaster = run('git push origin main:master', '5. Синхронизация ветки master');

  if (!pushMain.ok && !pushMaster.ok) {
    console.error('❌ Не удалось отправить изменения на GitHub. Проверьте соединение.');
    process.exit(1);
  }

  // 5. Опциональный вызов Vercel Deploy Hook, если настроен в .env.local
  const envPath = resolve(process.cwd(), '.env.local');
  let deployHookUrl = null;
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VERCEL_DEPLOY_HOOK_URL\s*=\s*([^\r\n]+)/);
    if (match && match[1]) {
      deployHookUrl = match[1].trim().replace(/['"]/g, '');
    }
  }

  if (deployHookUrl) {
    console.log('\n🔔 Отправка прямого сигнала в Vercel Deploy Hook API...');
    try {
      const hookRes = await fetch(deployHookUrl, { method: 'POST' });
      if (hookRes.ok) {
        console.log('✅ Сигнал Vercel Deploy Hook успешно принят сервером!');
      } else {
        console.warn(`⚠️ Hook ответил со статусом: ${hookRes.status}`);
      }
    } catch (e) {
      console.warn('⚠️ Не удалось вызвать Deploy Hook:', e.message);
    }
  }

  console.log('\n====================================================');
  console.log('🎉 ВСЕ ИЗМЕНЕНИЯ УСПЕШНО ОТПРАВЛЕНЫ В VERCEL!');
  console.log('⚡ Vercel автоматически начал сборку и обновление домена.');
  console.log('====================================================\n');
}

main();
