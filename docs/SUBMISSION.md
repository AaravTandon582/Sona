# Banana Hacks 2026 handoff

## Positioning

One sentence: **Sona turns inaccessible chart screenshots into data you can hear, explore, verify, and reuse.**

Primary audience: educators adapting charts in existing slides/worksheets, and students who benefit from textual or audio representations. Long-term validation must involve blind and low-vision users directly.

Best category fit: Best Creative Tool. Do not apply a fine-tuning claim: the project uses a pretrained OCR model.

## How the build addresses the rubric

| Criterion | Concrete evidence to show |
| --- | --- |
| Technical execution | Pixel segmentation, orientation inference, neural OCR, spatial association, axis fitting, and evidence review in one working pipeline. |
| Innovation | Image-to-accessibility reconstruction with source-linked evidence, audio exploration, and reusable outputs. Do not claim the first-ever chart sonification tool. |
| Image AI theme | Every output starts with image interpretation. The screenshot is the actual input; no sample data is injected into the extraction result. |
| Impact | A defined educator/student workflow, private local processing, no model API key, and standalone outputs usable after the hackathon. |
| Design/demo | The polished studio, a visible before/after, a short audible moment, and a transparent limitation statement. |

These are project features, not awarded or predicted scores. Winning depends on judging and the other submissions.

## Submission checklist

1. Run the working demo and inspect the three examples.
2. Make a **public GitHub repository** from this checkout. Preserve real commit timestamps. Do not change the timestamps or claim pre-event work was made during the event.
3. Make the hosted demo accessible to judges, or submit the recorded video. Sites initially publishes this project privately; an owner-only URL is not a public judging link.
4. Submit the project name, repository URL, working demo/video, and the [write-up](DEVPOST.md) through the official event portal. Upload a video under three minutes.
5. Disclose Codex assistance, the pretrained OCR model, open-source dependencies, and synthetic samples as listed in the README.

The event site has inconsistent deadline text: the [schedule](https://www.bananahacks.tech/schedule) says **11:59 PM EDT Sunday, October 11**, while the [prizes page](https://www.bananahacks.tech/prizes) says **11:59 PM AoE**. Use the earlier schedule deadline—**8:59 PM Pacific on Sunday, October 11, 2026**—unless organizers explicitly confirm otherwise.

## Scope to protect during the demo

Use supported single-series charts. Show that every number is reviewable. Say “axis estimate” when appropriate. Do not claim validated accessibility, general chart understanding, user adoption, custom training, or benchmark accuracy beyond the documented tests.

Useful final improvements during the remaining hackathon time: get feedback from one educator and one assistive-technology user; test more independently sourced charts; rehearse the two-minute story. Do not dilute the core demo with unrelated features.
