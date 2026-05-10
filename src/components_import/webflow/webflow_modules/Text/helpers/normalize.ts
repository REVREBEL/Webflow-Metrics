// The WFDL plugin runtime guarantees text values are always strings, but in
// DevLink compiled components props can be undefined when not provided by the
// consumer. We coerce nullish values to empty string to avoid runtime errors.
export const normalize = (
  text: string | undefined,
  caseSensitive: boolean
): string => (caseSensitive ? text ?? "" : (text ?? "").toLowerCase());
