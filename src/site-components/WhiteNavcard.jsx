"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function WhiteNavcard(
    {
        as: _Component = _Builtin.Link,
        navCardIcon = "https://cdn.prod.website-files.com/6994ad8d279287de73c3a891/6994ad8d279287de73c3a8ff_get-quote.svg",
        navCardIconAltText = "__wf_reserved_inherit",
        navCardParagraph = "Maximize topline and margin with data-backed strategy",
        tagSlot,
        tagRuntimeProps = {},
        whiteNavCardIconSlot,
        whiteNavCardHeadlineTag = "h3",
        whiteNavCardHeadlineText = "Revenue Strategy",

        whiteNavCardLink = {
            href: "#"
        },

        iconRuntimeProps = {}
    }
) {
    return (
        <_Component
            className="white-navcard"
            button={false}
            block="inline"
            options={whiteNavCardLink}><_Builtin.Block className="white-navcard_top-content" tag="div"><_Builtin.Block className="navcard_headline-wrapper" tag="div"><_Builtin.Heading
                        className="navcard_headline dropdown-2_max-width"
                        tag={whiteNavCardHeadlineTag}>{whiteNavCardHeadlineText}</_Builtin.Heading></_Builtin.Block></_Builtin.Block><_Builtin.Block className="white-navcard_bottom-content" tag="div"><_Builtin.Block className="navcard_paragraph" tag="div">{navCardParagraph}</_Builtin.Block><_Builtin.Block className="devlink-slot" tag="div" {...tagRuntimeProps}>{tagSlot}</_Builtin.Block></_Builtin.Block></_Component>
    );
}