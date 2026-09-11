import { createFileRoute } from '@tanstack/react-router';
// @ts-expect-error SosPage is a legacy JSX screen without a declaration file.
import SosPage from '../SosPage';

export const Route = createFileRoute('/sos')({
  component: SosPage,
});