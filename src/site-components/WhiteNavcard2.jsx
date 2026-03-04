"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function WhiteNavcard2(
    {
        as: _Component = _Builtin.Link,
        navCardIcon = "https://cdn.prod.website-files.com/6994ad8d279287de73c3a891/6994ad8d279287de73c3a8ff_get-quote.svg",
        navCardIconAltText = "__wf_reserved_inherit",
        navCardHeadlineTag = "h3",
        navCardHeadlineText = "Revenue Strategy",
        navCardParagraph = "Maximize topline and margin with data-backed strategy",
        tagSlot,

        navCardLink = {
            href: "#"
        }
    }
) {
    return (
        <_Component
            className="white-navcard-2"
            button={false}
            block="inline"
            options={navCardLink}><_Builtin.Block className="white-navcard_top-content-2" tag="div"><_Builtin.Block className="navcard_headline-wrapper-3" tag="div"><_Builtin.Heading
                        className="navcard_headline-3 dropdown-1_max-width"
                        tag={navCardHeadlineTag}>{navCardHeadlineText}</_Builtin.Heading></_Builtin.Block></_Builtin.Block><_Builtin.Block className="white-navcard_bottom-content-2" tag="div"><_Builtin.Block className="navcard_paragraph-3" tag="div">{navCardParagraph}</_Builtin.Block>{tagSlot}</_Builtin.Block></_Component>
    );
}