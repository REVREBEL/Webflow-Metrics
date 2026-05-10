"use client";
import * as React from "react";
import * as utils from "../../utils";
import { Props } from "../../types";

type HtmlEmbedProps = Props<
  "div",
  { tag?: React.ElementType; value?: string; content?: string }
>;

const HtmlEmbed = React.forwardRef<HTMLElement, HtmlEmbedProps>(
  function HtmlEmbed(
    { tag = "div", className = "", value = "", content = "", ...props },
    ref
  ) {
    // Support both 'value' (transformed/encoded) and 'content' (raw) props.
    const html = (content && content !== "" ? content : value) || "";
    return React.createElement(tag, {
      className: className + " w-embed",
      dangerouslySetInnerHTML: { __html: utils.removeUnescaped(html) },
      ...props,
      ref,
    });
  }
);

export default HtmlEmbed;
