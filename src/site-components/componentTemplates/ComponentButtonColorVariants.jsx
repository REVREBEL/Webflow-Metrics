"use client";
import React from "react";
import * as _Builtin from "../_Builtin";

export function ComponentButtonColorVariants(
    {
        as: _Component = _Builtin.Block,
        optionsButtonColorVariants = "Base",
        sotButtonSizeVariants,
        slotButtonSizeRuntimeProps = {}
    }
) {
    const _styleVariantMap = {
        "Base": "",
        "Color Primary": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d2",
        "Color Primary Inverse": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d3",
        "Color Primary Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d4",
        "Light": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d5",
        "Light Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d6",
        "Color 1": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d7",
        "Color 1 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d8",
        "Color 1 Outline Inverse": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0d9",
        "Color 2": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0da",
        "Color 2 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0db",
        "Color 2 Outline Inverse": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0dc",
        "Color 4": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0dd",
        "Color 5": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0de",
        "Color 5 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0df",
        "Color 5 Outline Inverse": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e0",
        "Color 6": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e1",
        "Color 6 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e2",
        "Color 7": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e3",
        "Color 8": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e4",
        "Color 8 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e5",
        "Color 8 Inverse": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e6",
        "Color 9": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e7",
        "Color 9 Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e8",
        "Alert": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0e9",
        "Alert Outline": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0ea",
        "Disabled": "w-variant-1affd3c9-893c-c52a-a820-02be5a92c0eb"
    };

    const _activeStyleVariant = _styleVariantMap[optionsButtonColorVariants];

    return (
        <_Component
            className={`component-button_color-variants ${_activeStyleVariant}`}
            tag="div"><_Builtin.Block
                className={`slot_button-size-variants ${_activeStyleVariant}`}
                tag="div"
                {...slotButtonSizeRuntimeProps}>{sotButtonSizeVariants}</_Builtin.Block></_Component>
    );
}