import * as React from "react";
import * as Types from "../types";

declare function ColorNavcard2(
    props: {
        as?: React.ElementType;
        colorCard1Icon?: Types.Asset.Image;
        colorCard2Icon?: Types.Asset.Image;
        colorCard1IconAltText?: Types.Basic.AltText;
        colorCard2IconAltText?: Types.Basic.AltText;
        colorCard3Icon?: Types.Asset.Image;
        colorCard3IconAltText?: Types.Basic.AltText;
        colorCard1HeadlineTag?: Types.Basic.HeadingTag;
        colorCard1HeadlineText?: React.ReactNode;
        colorCard2HeadlineTag?: Types.Basic.HeadingTag;
        colorCard2HeadlineText?: React.ReactNode;
        colorCard3HeadlineTag?: Types.Basic.HeadingTag;
        colorCard3HeadlineText?: React.ReactNode;
        colorCard1Paragraph?: React.ReactNode;
        colorCard1Link?: Types.Basic.Link;
        colorCard2Paragraph?: React.ReactNode;
        colorCard2Link?: Types.Basic.Link;
        colorCard3Paragraph?: React.ReactNode;
        colorCard3Link?: Types.Basic.Link;
        colorCard1LinkText?: React.ReactNode;
        colorCard2LinkText?: React.ReactNode;
        colorCard3LinkText?: React.ReactNode;
        colorCard1Image?: Types.Asset.Image;
        colorCard1ImageAltText?: Types.Basic.AltText;
        colorCard3Image?: Types.Asset.Image;
        colorCard3ImageAltText?: Types.Basic.AltText;
        colorCard2Image?: Types.Asset.Image;
        colorCard2ImageAltText?: Types.Basic.AltText;
        colorCard4Icon?: Types.Asset.Image;
        colorCard4IconAltText?: Types.Basic.AltText;
        colorCard4HeadlineTag?: Types.Basic.HeadingTag;
        colorCard4HeadlineText?: React.ReactNode;
        colorCard4Paragraph?: React.ReactNode;
        colorCard4Link?: Types.Basic.Link;
        colorCard4LinkText?: React.ReactNode;
        colorCard4Image?: Types.Asset.Image;
        colorCard4ImageAltText?: Types.Basic.AltText;
        optionsColorCardColor?: "Light" | "Dark";
    }
): React.JSX.Element