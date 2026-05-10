import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function ToggleGroup(props: {
  direction?: "Horizontal" | "Vertical";
  groupName?: string;
  layoutGapRem?: string;
  numberOfButtons?: "2" | "3" | "4" | "5" | "6" | "7" | "8";
  slotsButton1?: React.ReactNode;
  slotsButton2?: React.ReactNode;
  slotsButton3?: React.ReactNode;
  slotsButton4?: React.ReactNode;
  slotsButton5?: React.ReactNode;
  slotsButton6?: React.ReactNode;
  slotsButton7?: React.ReactNode;
  slotsButton8?: React.ReactNode;
  spacingPaddingBlockRem?: string;
  spacingPaddingInlineRem?: string;
  targetId?: string;
}): React.JSX.Element;
