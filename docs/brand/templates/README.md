# twente.dev — templates

Print and presentation formats. Each is **one self-contained HTML file** — no build
step, no slide software, no subscription. Copy the file, edit, print to PDF. Fonts
come from Google Fonts and fall back to the system stack offline; the visual rules
live in [`../README.md`](../README.md).

| File                   | What                      | Output                                                 |
| ---------------------- | ------------------------- | ------------------------------------------------------ |
| `slides.html`          | slide deck, 7 slide types | present in browser, or PDF at exactly 16:9             |
| `letterhead.html`      | briefpapier, A4           | PDF, or type directly in the browser (contenteditable) |
| `email-signature.html` | signature block           | copy-paste into any mail client                        |

## Printing to PDF (all templates)

Chrome/Chromium: **Ctrl+P → destination "Save as PDF" → margins: none →
background graphics: ON**. The `@page` size is set in each file (16:9 for slides,
A4 for the letterhead) — do not override it in the dialog.

## Making a new deck

1. `cp slides.html slides-002-<theme>.html` — keep the original as the clean master.
2. Duplicate the `<section class="slide …">` blocks you need, delete the rest.
   The seven types: title, content, stats, two-column, quote, section divider
   (the red edge), closing.
3. The house rules are in a comment at the top of the file. The two that people
   break first: **one statement per view** at display size, and **one red signal
   per slide**.

## What is deliberately missing

- A Word/Docs version of the letterhead. HTML+PDF keeps the typography and the
  tokens exact; a `.docx` drifts the moment someone opens it. If a partner needs
  an editable document, send them the PDF plus plain text.
- A PowerPoint/Keynote theme. Same reason. The PNG marks in
  [`../png/`](../png/) exist for the cases where a deck must be built in slide
  software anyway.
