import type { ReactNode } from "react";

import { caseEquals } from "../../Text/helpers/caseEquals";
import { toText } from "./toText";

export const textEquals =
  (config: { text: string; caseSensitive: boolean }) =>
  (value: ReactNode | undefined): boolean =>
    caseEquals(config)(toText(value));
