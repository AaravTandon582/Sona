# Demo script — approximately 2 minutes 30 seconds

Before recording: use desktop Chrome, close unrelated tabs, set browser zoom so the studio and audio strip are visible, check system audio, and run one analysis to warm the model cache. Reload to return to the source image. Do not present illustrative data as a real customer study.

**0:00–0:20 — The problem**

“When a chart becomes a screenshot, its data gets locked inside pixels. If you rely on a screen reader—or you need another way to understand a picture—you can’t explore it. Sona gives that chart a voice.”

Show the original sample. Click **Make it accessible**.

**0:20–0:50 — The transformation**

“This is real, local inference. Sona finds the bars with computer vision, reads the labels with a neural OCR model, and connects the two into a data model. Nothing about the answer is preloaded.”

Click several recovered bars. Show how the source-region overlay follows the selection. Use arrow keys.

“Every output points back to the evidence in the source. You can explore each category using the keyboard.”

**0:50–1:10 — The memorable moment**

Click **Listen to chart**. Pause talking while the sequence plays.

“Higher values become higher pitches. The shape of the data becomes something you can hear. A spoken summary and a data table provide exact numbers too.”

**1:10–1:40 — Engineering depth**

Choose **Try another example → Solar generation**, then analyze.

“This chart has no printed values. Sona fits a scale from the axis ticks and estimates values from the bar geometry. The evidence column explicitly marks them as estimates. If it can’t calibrate the axis, it uses relative sizes instead of pretending to know the units.”

Open **Data**, show evidence labels, and edit a value. Return to **Explore**.

**1:40–2:05 — A useful result**

Export an **Accessible report**, then open it in a browser. Show its chart, description, and semantic table.

“An educator can take a chart from an existing worksheet and create something students can actually explore. The result is reusable outside Sona. The whole pipeline runs on the device, without uploading the image or configuring an API key.”

**2:05–2:30 — Honest close**

“Our prototype focuses on single-series bar charts. We tested real OCR, geometry, keyboard interaction, exports, and automated accessibility checks. The next step is evaluation with blind and low-vision users and a broader chart dataset. We’re not just extracting a picture. We’re opening up the data inside it.”

Close on the original/result view with an active bar.
