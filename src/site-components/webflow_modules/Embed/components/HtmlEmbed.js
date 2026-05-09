"use client";
import * as React from "react";
import * as utils from "../../utils";
const HtmlEmbed = React.forwardRef(function HtmlEmbed(
  { tag = "div", className = "", value = "", content = "", ...props },
  ref
) {
  const html = (content && content !== "" ? content : value) || "";
  return React.createElement(tag, {
    className: className + " w-embed",
    dangerouslySetInnerHTML: { __html: utils.removeUnescaped(html) },
    ...props,
    ref,
  });
});
export default HtmlEmbed;
