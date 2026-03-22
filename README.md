# OpenDAW

OpenDAW is a browser-first digital audio workstation project focused on fast music creation, timeline-based review, and collaborative workflows.

## Repository layout

- `src/` React + TypeScript application scaffold
- `docs/` product, UX, and architecture documents
- `index.html`, `vite.config.ts`, `tsconfig*.json` app build configuration

## Development

```bash
npm install
npm run dev
```

## Current status

- project dashboard shell
- editor shell with transport, track list, timeline, comments, and bottom panel placeholders
- document-aligned frontend module structure for dashboard and editor work

## Next steps

1. Add real routing and project state management.
2. Implement timeline interactions and piano roll editing.
3. Connect authentication, project APIs, autosave, and collaboration services.
