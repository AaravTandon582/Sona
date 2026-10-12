# Measured evaluation

These are small synthetic functional checks, not a claim of real-world model accuracy or accessibility effectiveness.

## Real browser OCR

Chrome runs the bundled English Tesseract LSTM model on rendered PNG pixels. Sample values are not supplied to extraction code.

| Fixture | Bars | Expected values | Recovered values | Method |
| --- | ---: | --- | --- | --- |
| Community garden | 6 | 24, 42, 35, 68, 83, 61 | 24, 42, 35, 68, 83, 61 | Printed labels |
| Library visits | 5 | 120, 185, 145, 230, 195 | 120, 185, 145, 230, 195 | Printed labels; horizontal |
| Solar generation | 7 | 18, 26, 22, 32, 29, 15, 24 | 17.9, 25.9, 21.9, 31.9, 28.9, 14.9, 23.9 | Axis calibration |

In recorded local test runs, analysis took approximately 0.7–2.2 seconds per sample on this machine. Timing is not a cross-device benchmark; warm model caches affect it. The test permits an absolute error under 1 unit for axis estimates.

Additional input-file tests independently draw different chart layouts, upload them via the file input, and compare extracted values. They include purple bars, grayscale bars, relative-size fallback, a blank-image rejection, and exported SVG/HTML/CSV behavior. See `tests/uploads.mjs` for reproducible fixtures and assertions.

| Independent uploaded fixture | Expected | Recovered |
| --- | --- | --- |
| Purple bars | 16, 33, 49, 25 | 16, 33, 49, 25 |
| Grayscale bars | 27, 44, 19, 38 | 27, 44, 19, 38 |
| Unlabeled bars, normalized | 25, 50, 75, 100 | 25, 50, 75, 100 |

Across these six synthetic fixtures, 19 printed values were recovered exactly, seven axis-based values were within 0.1, and four normalized values matched their expected ratios. The upload suite observed zero third-party network requests and zero JavaScript page errors.

## Interaction and accessibility

The browser suite checks arrow-key navigation, the active bar, play/stop controls, edited values, data export, and mobile overflow. axe-core checks WCAG A/AA rules in chart, table, guide, project, mobile, and dialog states. Automated checks cannot validate the lived experience of a screen-reader user; manual assistive-technology and participant testing remain future work.

## Unit-level invariants

- Baseline consensus handles horizontal and vertical orientation.
- Small components do not become bars; blank images fail explicitly.
- Printed labels bind spatially, and axis ticks calibrate lengths.
- Unknown values never silently mix relative and absolute units.
- Export text is escaped; CSV formula-like labels are neutralized.

Run `npm test`, then start the app and run `npm run test:browser` and `npm run test:uploads`. Screenshots, accessibility results, and export artifacts go to the ignored `test-results/` directory.

Run `npm run test:usability` to verify cancellation, retry after an OCR-model download failure, keyboard focus while editing, undo, description copying, and responsive layout. All three browser suites and all 10 unit tests passed in the final October 11, 2026 release check.
