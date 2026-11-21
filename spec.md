# Project Specification: 7K Guild OCR Auto-Logger (Google Apps Script)

## 1. Overview & Architecture
A modular, keyboard-first **Google Apps Script** add-on embedded directly inside Google Sheets for automating score extraction and logging for **Seven Knights (Re:BIRTH)** guild activities (**Guild War** and **Expedition Boss**).

- **Runtime Environment:** Google Apps Script (`HtmlService` Modal Dialogs, `1400x800` viewport)
- **Client-Side OCR Engine:** `Tesseract.js v5` (runs 100% locally in the user's browser; zero external image uploads)
- **Fuzzy Name Matching:** `Fuse.js v7` with 1-to-1 greedy unique roster assignment
- **UI & Styling:** Tailwind CSS (Dark Zinc/Amber/Purple theme), Google Fonts (`Cinzel Decorative`, `Inter`, `JetBrains Mono`)

---

## 2. Modular File Structure
Decoupled into independent modules so **Guild War** can be deployed standalone to guild leaders without exposing **Expedition Boss** features:

```text
├── Code.gs                     # Main entry point (onOpen menu builder with dynamic module detection)
├── GuildWarScript.gs           # Backend Sheet read/write logic for Guild War
├── GuildWar.html               # Frontend OCR & verification UI for Guild War
└── spec.md                     # System specification & Sheet mapping documentation