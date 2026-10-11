import { createWorker, PSM } from 'tesseract.js';

let cachedSession;

function getSession() {
  if (cachedSession) return cachedSession;
  const session = { listener: () => {} };
  const failure = new Promise((_, reject) => { session.fail = reject; });
  session.created = createWorker('eng', 1, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr/core',
    langPath: '/ocr/lang',
    logger: message => session.listener(message.status, message.progress || 0),
    errorHandler: () => session.fail(new Error('The text reader could not load or read this image. Check your connection and try again.')),
  });
  session.ready = Promise.race([session.created, failure]);
  cachedSession = session;
  return session;
}

export async function readWords(canvas, bars, background, onProgress, { signal, timeoutMs = 60000 } = {}) {
  if (signal?.aborted) throw new DOMException('Reading cancelled.', 'AbortError');
  const session = getSession();
  session.listener = onProgress;
  let timer, abort;
  const interrupted = new Promise((_, reject) => {
    abort = () => reject(new DOMException('Reading cancelled.', 'AbortError'));
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => reject(new Error('Reading took too long. Check your connection and try again, or use a smaller, clearer screenshot.')), timeoutMs);
  });
  const reading = (async () => {
    const worker = await session.ready;
    if (signal?.aborted || cachedSession !== session) throw new DOMException('Reading cancelled.', 'AbortError');
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT, user_defined_dpi: '150' });
    const clean = document.createElement('canvas');
    clean.width = canvas.width;
    clean.height = canvas.height;
    const ctx = clean.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    ctx.fillStyle = `rgb(${background.join(',')})`;
    for (const bar of bars) ctx.fillRect(bar.x - 1, bar.y - 1, bar.w + 2, bar.h + 2);
    const { data } = await worker.recognize(clean, {}, { blocks: true, text: true });
    const words = [];
    for (const block of data.blocks || [])
      for (const paragraph of block.paragraphs || [])
        for (const line of paragraph.lines || [])
          for (const word of line.words || [])
            if (word.text.trim()) words.push(word);
    return { words, text: data.text };
  })();
  try {
    return await Promise.race([reading, interrupted]);
  } catch (error) {
    if (cachedSession === session) cachedSession = null;
    session.created.then(worker => worker.terminate()).catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    session.listener = () => {};
  }
}
