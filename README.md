# Personal Notes — Dark Slate

A responsive personal notes application built with React and Vite. Dark Slate pairs a calm slate-blue visual system with Light and Dark themes, a mountain-inspired background, and a focused interface for writing and organizing notes.

## Features

- Register and sign in through the Dicoding Notes API.
- Create, view, search, archive, restore, and delete notes.
- Light and Dark themes with the selected preference saved in `localStorage`.
- Indonesian and English interface language selection.
- Responsive desktop sidebar and compact mobile navigation.
- Loading, empty, and error states for key note flows.
- Automated tests with Vitest and React Testing Library.

## Tech Stack

- React 18
- React Router
- Vite
- Vitest
- React Testing Library
- Prettier
- Dicoding Notes API

## Requirements

- Node.js 22.12 or newer
- npm
- Internet connection for API requests

## Run Locally

1. Clone this repository.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Quality Checks

Run these before opening a pull request or publishing a release:

```bash
npm run format:check
npm test
npm run build
npm audit
```

To preview the production build locally:

```bash
npm run preview
```

## API

The app currently uses the Dicoding Notes API at `https://notes-api.dicoding.dev/v1`. An internet connection is required for account and notes operations. The API base URL is public configuration, not a secret; never commit account passwords, access tokens, or personal notes to this repository.

## Design

- **Light Mode:** cool off-white surfaces, slate-blue accents, and soft contrast.
- **Dark Mode:** deep navy surfaces, slate-blue accents, and a low-glare palette.
- Both themes share the same components, layout, and navigation.
- The mountain-inspired background is part of the app's visual identity.

## Screenshots

Add screenshots of both themes here before publishing the repository. Capture them using demo notes and a test account, and make sure no personal notes, email addresses, or account details are visible.

## Notes

- `package-lock.json` is committed so installs can be reproduced with `npm ci`.
- `node_modules/`, `dist/`, local environment files, and OS-generated files should not be committed.
