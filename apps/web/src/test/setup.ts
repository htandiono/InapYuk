/**
 * Vitest global test setup for the Web workspace.
 *
 * Imports jest-dom matchers so every test file can use
 * `toBeInTheDocument()`, `toHaveTextContent()`, etc.
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.fetch = vi.fn();
