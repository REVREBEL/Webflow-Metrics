import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function NumberStepper(props: {
  colorsBackground?: string;
  colorsBorderColor?: string;
  colorsButtonBackground?: string;
  colorsButtonColor?: string;
  colorsTextColor?: string;
  mode?: "Week" | "Month" | "Quarter" | "Year" | "Custom";
  rangeMaxOffset?: number;
  styleBorderRadius?: string;
  typographyButtonNumberSize?: string;
  typographyDateFontSize?: string;
  typographyFontFamily?: string;
  typographyFontWeight?: string;
}): React.JSX.Element;
