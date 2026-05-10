import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function TriggerButton(props: {
  groupGroupName?: string;
  label?: string;
  offStateBackgroundOff?: string;
  offStateFontColorOff?: string;
  onStateBackgroundOn?: string;
  onStateFontColorOn?: string;
  triggerId?: string;
  typographyFontFamily?: string;
  typographyFontWeight?: string;
}): React.JSX.Element;
