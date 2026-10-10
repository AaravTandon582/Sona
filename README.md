# Sona — Give every chart a voice

Sona turns a bar-chart screenshot into explorable data, sound, and reusable accessible graphics. It is built for educators preparing materials and people who need a different way to read charts.

**Upload → detect bars → local neural OCR → reconstruct data → review → explore, listen, export.**

The complete image pipeline runs in the browser. There are no API keys, image uploads to a server, inference charges, or prerecorded extraction results. Three synthetic examples are included, and each is analyzed from its actual pixels.

## Run locally

Use Node.js 22 or newer (`nvm use` if you have nvm).

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. Click **Make it accessible**, then **Listen to chart**. Use **Try another example → Solar generation** to demonstrate axis calibration when no numeric bar labels are present.

```sh
npm test
npm run build
npm run preview
```

The build copies the OCR worker, WASM engines, and English trained model into `dist/`. Fonts are also local. Deploy the contents of `dist/` to any static web host; configure no SPA rewrite for `/ocr` assets. The Sites project identity is in `.openai/hosting.json`.

## What works

- PNG/JPEG/WEBP upload, drag and drop, and clipboard paste; 12 MB input cap.
- Single-series, solid, nonnegative vertical or horizontal bars on plain backgrounds.
- Original connected-component detector with fill filtering and baseline consensus.
- Pretrained Tesseract English LSTM OCR in a WebAssembly worker; bar masking improves text isolation.
- Spatial value and label matching; least-squares calibration from numeric axis ticks.
- Consistent relative-size fallback if the series cannot be fully calibrated.
- Source-region overlays that follow the selected output bar.
- Roving keyboard focus (arrows, Home, End), individual tones, chart sonification, and spoken summaries.
- An editable table with evidence labels: printed value, axis estimate, relative size, or manually reviewed.
- Accessible SVG, CSV, standalone HTML report, and experimental raised-line SVG exports.
- Local assets and local inference; the app does not persist source images.

## Honest limitations

This is a chart-accessibility prototype, not an arbitrary chart reader. Pie, line, grouped, stacked, 3D, log-axis, negative-value, and complex-background charts are outside its supported scope. Unsupported layouts can yield plausible detections; review the source overlay. OCR may misread text. Axis estimates can have pixel/rounding error. English labels are supported, and multiline labels may be incomplete. A machine score is not a probability that a value is correct.

No user study with blind or low-vision participants has been completed. Raised-line graphics need specialist adaptation and validation; they are not certified tactile diagrams. Browser/OS speech availability varies. Sonification provides an additional representation, not an exact numerical replacement for the table.

## Tests

Unit tests cover geometry, calibration, incomplete evidence, numeric parsing, blank inputs, and export escaping. Browser tests run the real bundled OCR model and exercise values, editing, keyboard navigation, audio controls, downloads, responsive layout, and axe accessibility checks.

With Google Chrome installed and the dev server running:

```sh
npm run test:browser
npm run test:uploads
```

Test screenshots and observations are written to `test-results/` (ignored by Git). See [evaluation](docs/EVALUATION.md) for measured results and their limits.

## Submission package

- [Devpost write-up, under 500 words](docs/DEVPOST.md)
- [Three-minute demo script](docs/DEMO.md)
- [Architecture and engineering decisions](docs/ARCHITECTURE.md)
- [Rubric mapping and final handoff](docs/SUBMISSION.md)

## Credits and AI disclosure

Original application and image-reconstruction code were created with OpenAI Codex assistance during Banana Hacks 2026. No custom training or fine-tuning is claimed. Runtime image intelligence uses the pretrained Tesseract English model, not an LLM or image-generation API.

- [Tesseract.js](https://github.com/naptha/tesseract.js), [Tesseract.js-core](https://github.com/naptha/tesseract.js-core), and [English language data](https://github.com/naptha/tessdata): Apache 2.0.
- [Vite](https://github.com/vitejs/vite): MIT. [Playwright](https://github.com/microsoft/playwright): Apache 2.0. [axe-core](https://github.com/dequelabs/axe-core): MPL 2.0; used for tests.
- DM Sans and Manrope: SIL Open Font License; license files are included under `public/fonts/`.
- Sample charts and their data are synthetic and authored for this project. They are not real-world impact evidence.
- Accessibility direction informed by [W3C guidance for complex images](https://www.w3.org/WAI/tutorials/images/complex/). Automated checks do not establish complete accessibility conformance.

See [third-party notices](THIRD_PARTY_NOTICES.md). This project uses no private datasets or proprietary chart images.
