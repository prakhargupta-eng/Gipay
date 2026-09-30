# GigPay Project Guidelines

## Overview
- This is a React Native project using TypeScript.
- Prioritize clean, readable, and maintainable code over clever shortcuts.
- Keep components small and focused on a single responsibility.

## Code Style & Architecture
- **Language**: Use TypeScript for all new files. Always define interfaces/types for props, state, and API responses.
- **Components**: Always use functional components with React Hooks. Do not use class components.
- **File Structure**: Keep related files grouped together (e.g., screens in `src/screens`, reusable hooks in `src/hooks`, utilities in `src/utils`).

## Best Practices
- **API Calls**: Always use the predefined API configurations (e.g., from `src/config/apiConfig.ts`). Avoid hardcoding URLs directly into components or hooks.
- **Location & Maps**: For location-based features, utilize the existing `useLocation.ts` hook and `mapUtils.ts` utility functions to maintain consistency.
- **State Management**: Use local component state where possible. If using a global state management library (like Redux or Zustand), follow the established patterns in the codebase.
- **Styling**: Ensure styles are consistent and responsive. Avoid inline styles where possible; use StyleSheet or the project's chosen styling library.

## Error Handling & Debugging
- Implement robust error handling for API requests and location services.
- Avoid leaving `console.log` statements in production-ready code. Use proper logging mechanisms if applicable.
