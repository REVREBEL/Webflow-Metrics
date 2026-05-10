"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "../devlinkScope";
import NotSupported from "../webflow_modules/Builtin/components/NotSupported";

export function ToggleGroup({}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <NotSupported _atom={"Code Island"}>
        {slotsButton1}
        {slotsButton2}
        {slotsButton3}
        {slotsButton4}
        {slotsButton5}
        {slotsButton6}
        {slotsButton7}
        {slotsButton8}
      </NotSupported>
    </div>
  );
}
