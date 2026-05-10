import { normalize } from "./normalize";

export const caseEquals =
  ({ text, caseSensitive }: { text: string; caseSensitive: boolean }) =>
  (value: string | undefined): boolean =>
    normalize(value, caseSensitive) === normalize(text, caseSensitive);
