"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function ColorNavcard(
    {
        as: _Component = _Builtin.Block,

        colorNavCardLink = {
            href: "#"
        },

        colorNavCardHeadlineTag = "h3",
        colorNavCardHeadlineText = "Travel Trends",
        colorNavCardText = <>{"A collection of trends from the largest travel sites and researchers."}<br /></>,
        colorNavCardTagSlot,
        colorNavCardTagSlotRuntimeProps = {},
        colorNavCardIconSlot,
        colorNavCardIconRuntimeProps = {},
        colorNavCardImageSlot,
        colorNavCardImageSlotRuntimeProps = {}
    }
) {
    return (
        <_Component
            className="navcard-wrapper"
            id="w-node-b07c203a-b779-9706-3a82-9ddf4d6f6037-4d6f6037"
            tag="div"><_Builtin.Link
                className="color-navcard is-color-2 is-border-width_3px"
                button={false}
                block="inline"
                options={colorNavCardLink}><_Builtin.Block
                    className="color-navcard_right-content is-inverse_color-2"
                    id="w-node-b07c203a-b779-9706-3a82-9ddf4d6f6039-4d6f6037"
                    tag="div"><_Builtin.Block className="navcard_headline-wrapper" tag="div"><_Builtin.Block className="navcard_icon" tag="div"><_Builtin.Block className="icon_3x3" tag="div" {...colorNavCardIconRuntimeProps}>{colorNavCardIconSlot}</_Builtin.Block></_Builtin.Block><_Builtin.Heading
                            className="navcard_headline dropdown-2_max-width"
                            tag={colorNavCardHeadlineTag}>{colorNavCardHeadlineText}</_Builtin.Heading></_Builtin.Block><_Builtin.Block className="navcard_paragraph" tag="div">{colorNavCardText}</_Builtin.Block><_Builtin.Block className="navcard-tag" tag="div" {...colorNavCardTagSlotRuntimeProps}>{colorNavCardTagSlot}</_Builtin.Block></_Builtin.Block><_Builtin.Block className="color-navcard_left-content" tag="div"><_Builtin.Block
                        className="navcard_image"
                        tag="div"
                        {...colorNavCardImageSlotRuntimeProps}>{colorNavCardImageSlot}</_Builtin.Block></_Builtin.Block></_Builtin.Link></_Component>
    );
}