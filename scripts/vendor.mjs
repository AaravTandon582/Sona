import { mkdir, cp, readdir } from 'node:fs/promises';
await mkdir('public/ocr/core', { recursive: true });
await mkdir('public/ocr/lang', { recursive: true });
await mkdir('public/ocr/licenses', { recursive: true });
await cp('node_modules/tesseract.js/LICENSE.md','public/ocr/licenses/tesseract.js.txt');
await cp('node_modules/tesseract.js-core/LICENSE','public/ocr/licenses/tesseract.js-core.txt');
await cp('public/licenses/english-data.txt','public/ocr/licenses/english-data.txt');
await cp('node_modules/tesseract.js/dist/worker.min.js', 'public/ocr/worker.min.js');
for (const file of await readdir('node_modules/tesseract.js-core')) {
  if (file.endsWith('.wasm') || file.endsWith('.wasm.js')) await cp(`node_modules/tesseract.js-core/${file}`, `public/ocr/core/${file}`);
}
await cp('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'public/ocr/lang/eng.traineddata.gz');
console.log('OCR worker, WASM engines, and English model are served locally.');
