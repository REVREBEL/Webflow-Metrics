"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function ChartByDayMix({
  text1 = "capactity",
  text2 = "0102030405060708 091011121314151617 1819202122232425 2627282930",
  text3 = "TRANSIENTVSGROUP OTB BYDAY",
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block className={"bar-mix-card add-shadow"} tag={"div"}>
        <Block className={"bar-mix-card_plot-area"} tag={"div"}>
          <Block className={"bar-mix-card_bar-chart"} tag={"div"}>
            <Block className={"kpi-card_chart"} tag={"div"}>
              <Block className={"div-block-6 _1"} tag={"div"}>
                <Block className={"div-block-6 _1"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _3"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _5"} tag={"div"}>
                <Block className={"div-block-6 _5"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _4"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _4 is-wkend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m is-weekend"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _4 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m is-weekend-m2"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _5"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _6"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _5"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _5"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _2"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _3"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _5 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _4 is-weekend"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _5 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _5 is-weekend"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _7"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _6"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _7"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _7"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _7"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _8"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _7"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _9"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _7"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _10"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _7 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _11 is-weekend"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _7 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m is-weekend"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _8"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _8"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _14"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _12"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _8"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _18"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _9"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _17"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _13"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _13"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _10"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _16"} tag={"div"} />
              </Block>
              <Block className={"div-block-6 _11 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _15 is-weekend-m2"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _11 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _15 is-weekend-m2"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _12 is-weekend"} tag={"div"}>
                <Block
                  className={"div-block-6 _1 _2m _14 is-weekend-m2"}
                  tag={"div"}
                />
              </Block>
              <Block className={"div-block-6 _14"} tag={"div"}>
                <Block className={"div-block-6 _1 _2m _12"} tag={"div"} />
              </Block>
            </Block>
          </Block>
          <Block className={"bar-mix-card_label"} tag={"div"}>
            {text1}
          </Block>
          <Block className={"bar-mix-card_days"} tag={"div"}>
            {text2}
          </Block>
        </Block>
        <Block className={"flex_vertical"} tag={"div"}>
          <Block className={"kpi-card_label is-secondary"} tag={"div"}>
            {text3}
          </Block>
        </Block>
      </Block>
    </div>
  );
}
