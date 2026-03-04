"use client";
import React from "react";
import * as _Builtin from "../_Builtin";

export function ComponentButtonColorVariants2(
    {
        as: _Component = _Builtin.Block,
        buttonColorSlot,
        optionsButtonColorVariants = "Base"
    }
) {
    const _styleVariantMap = {
        "Base": "",
        "Color Primary": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecbb",
        "Color Primary Inverse": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecbc",
        "Color Primary Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecbd",
        "Light": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecbe",
        "Light Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecbf",
        "Color 1": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc0",
        "Color 1 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc1",
        "Color 1 Outline Inverse": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc2",
        "Color 2": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc3",
        "Color 2 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc4",
        "Color 2 Outline Inverse": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc5",
        "Color 4": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc6",
        "Color 5": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc7",
        "Color 5 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc8",
        "Color 5 Outline Inverse": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecc9",
        "Color 6": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecca",
        "Color 6 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910eccb",
        "Color 7": "w-variant-cd230441-0755-2c0b-d835-4dd8b910eccc",
        "Color 8": "w-variant-cd230441-0755-2c0b-d835-4dd8b910eccd",
        "Color 8 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecce",
        "Color 8 Inverse": "w-variant-cd230441-0755-2c0b-d835-4dd8b910eccf",
        "Color 9": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecd0",
        "Color 9 Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecd1",
        "Alert": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecd2",
        "Alert Outline": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecd3",
        "Disabled": "w-variant-cd230441-0755-2c0b-d835-4dd8b910ecd4"
    };

    const _activeStyleVariant = _styleVariantMap[optionsButtonColorVariants];

    return (
        <_Component
            className={`component-button_color-variants-2 ${_activeStyleVariant}`}
            tag="div">{buttonColorSlot}</_Component>
    );
}