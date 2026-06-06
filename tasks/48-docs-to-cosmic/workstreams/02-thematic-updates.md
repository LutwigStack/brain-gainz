# 02 Thematic Updates

## Status

`planned`

## Goal

Add a short, single-source-of-truth section to the root `README.md` (or a new `docs/concept.md` if the README is too crowded) that explains the cosmic direction. This is the section a new contributor reads first.

## Why This Matters

A single, well-written "concept" section replaces a dozen scattered metaphors. New contributors (human or AI) read it once and stop reinventing the wrong mental model in their own notes.

## Scope

- a new section in the root `README.md` (preferred) or a new file `docs/concept.md` (fallback);
- a one-paragraph "what is this app" description;
- a one-paragraph "what is the cosmic direction" description;
- a one-paragraph "what is the Карта знаний" description;
- a list of the eight spheres with their cosmic roles (code = central star, math = satellite cluster, etc.);
- a "legacy naming" link back to the `Legacy naming` sections in the affected docs and tasks.

## Requirements

### Concept section

- the section is named `Концепция` and lives at the top of the `README.md`, after the project name and before the "how to run" section;
- the prose is in Russian, matches the user-facing voice in the app, and is written in the cosmic metaphor (sectors, planets, jump routes, current star);
- the eight spheres are listed with one sentence each: their name, their cosmic role, and their user-facing meaning;
- the section links to the `Карта знаний` task epic (40) and to the cosmic canvas epic (47).

### Legacy naming

- a short paragraph at the bottom of the `Концепция` section explains that the app used to use a city / atlas metaphor and that the cosmic direction is the current one;
- the paragraph links to epic 40 (lexicon), epic 47 (canvas), and epic 48 (this epic).

## Out Of Scope

- A full rewrite of the `README.md` (only the `Концепция` section is touched);
- A new `docs/concept.md` if the README already has the section;
- Localisation to English or other languages.

## Implementation Hints

- Keep the section under 30 lines; a long concept section does more harm than good;
- Use the existing heading style in the README (`## Concept` or `## Концепция`, whichever the file already uses);
- If the README has a `## Description` or `## О проекте` section, this epic renames it to `## Концепция` and rewrites it.

## Done When

- The `Концепция` section exists in the `README.md` (or in a new `docs/concept.md`).
- The section is under 30 lines and links to epics 40, 47, and 48.
- A new contributor reading the section can answer "what is this app, what is the cosmic direction, and what is the `Карта знаний`" without reading any other file.
