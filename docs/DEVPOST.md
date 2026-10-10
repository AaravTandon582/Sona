# Sona — Give every chart a voice

## Inspiration

A chart copied into a worksheet or presentation becomes a flat picture. Its numbers disappear into pixels. A screen reader cannot explore its bars, and the person preparing the document may no longer have the spreadsheet. We wanted to recover access from the artifact people actually have: a screenshot.

## What it does

Sona transforms bar-chart images into keyboard-explorable charts, editable data, spoken descriptions, and sound. Each bar becomes a note: higher values produce higher pitches. Selecting a recovered value highlights its exact region in the original image. Educators can export a described SVG, CSV, or standalone HTML report with a semantic data table. An experimental raised-line export provides a starting point for tactile adaptation.

## How we built it

The browser pipeline combines original computer vision with a pretrained neural OCR model. Connected-component segmentation finds solid bar regions; geometry filtering and baseline consensus infer orientation. Sona masks the bars, runs Tesseract’s English LSTM model in a WebAssembly worker, and spatially associates the recognized labels and numbers with the detected shapes.

When printed values are absent, it fits a linear calibration to axis ticks and reconstructs values from bar endpoints. If calibration is incomplete, the entire series switches to clearly labeled relative sizes. Editable evidence labels distinguish printed values, axis estimates, and human corrections. Web Audio maps the reconstructed values to pitch; browser speech reads a computed summary.

The app, model, and fonts are served together. Image pixels stay in the browser, and there is no API key to configure. Image understanding is the entry point for every output.

## What we learned

The hardest part was preserving trust while joining uncertain signals. We fixed footnotes being mistaken for category labels, added consistent fallback units, and made each recovered value reviewable against the source. Browser tests run actual OCR, alongside geometry tests and automated accessibility checks.

## What is next

The prototype supports English, solid, single-series, nonnegative bar charts. It does not support arbitrary chart types. We want to test with blind and low-vision users, evaluate a larger real-world dataset, and add manual crop/calibration tools before expanding to grouped bars. Raised-line exports require specialist review.

Built with Tesseract.js, its pretrained English model, Vite, Web Audio, and browser speech synthesis. Original code was developed with OpenAI Codex assistance. Sample charts are synthetic. No custom training or fine-tuning is claimed.
