# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

CampusFlow is a Next.js 16 application for college resource management - allowing students and faculty to book labs, equipment, and classrooms. The project uses Tailwind CSS v4 for styling with a custom dark theme featuring an orange-accented color palette.

## Tech Stack

- **Framework**: Next.js 16.2.3 with App Router
- **React**: 19.2.4 (React 19 beta)
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Fonts**: Inter (body) and Poppins (headings) via next/font
- **TypeScript**: Full TypeScript codebase

## Key Architecture Patterns

### Theme System
- Custom `ThemeProvider` in `app/hooks/useTheme.tsx` manages theme state
- Themes stored in `localStorage` with `campusflow-theme` key
- CSS variables drive theme colors (see `globals.css`)
- System preference detection (`prefers-color-scheme: dark`) on first visit

### Loading State Management
- `LoadingProvider` component tracks navigation state via `usePathname`
- Shows `LoadingOverlay` during route transitions (400ms delay)
- Disables body scroll during loading

### Component Structure
- `'use client'` directive on all interactive components
- Navbar uses `useState` for scroll state and mobile menu
- Forms validate before submission with error state management
- Mock async operations (1.5s delay) before navigation

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

## Color Palette (Dark Theme)

| Use | Color |
|-----|-------|
| Background (main) | `#080708` |
| Background (secondary) | `#241715` |
| Text (primary) | `#F5D0C5` |
| Text (muted) | `#6B717E` |
| Accent (primary) | `#ef6751` |
| Accent (hover) | `#d3513e` |

## Custom CSS Variables

Defined in `globals.css`:
- `--font-inter`, `--font-poppins`: Font families
- `--theme-light-*`, `--theme-dark-*`: Theme color variables
- `--color-bg-dark`, `--color-text-dark`: Legacy dark theme variables

## Directory Structure

```
frontend/app/
├── auth/          # Authentication pages (signin, signup)
├── dashboard/     # User dashboard with resources
├── components/    # Reusable components (Navbar, ThemeToggle, Loading*)
├── hooks/         # Custom hooks (useTheme)
├── layout.tsx     # Root layout with providers
├── page.tsx       # Landing page
├── loading/       # Loading page
└── globals.css    # Global styles and theme variables
```
