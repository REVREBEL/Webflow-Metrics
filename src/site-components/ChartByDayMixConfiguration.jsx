"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import Heading from "./webflow_modules/Basic/components/Heading";
import NotSupported from "./webflow_modules/Builtin/components/NotSupported";

export function ChartByDayMixConfiguration({
  cardHeadline = "Configuration",
  customTriggerButtonGroupName = "period-group",
  customTriggerButtonLabel = "Custom",
  customTriggerButtonTriggerId = "date-input",
  metric1ConfigMetricSlot,
  metric1Metric1WeekdayColor,
  metric1Metric1WeekendColor,
  metric1MetricLabel = "Metric 1",
  metric2ConfigMetricSlot,
  metric2Metric2WeekdayColor,
  metric2Metric2WeekendColor,
  metric2MetricLabel = "Metric 2",
  monthToggleButtonGroupName = "period-group",
  monthToggleButtonLabel = "Month",
  periodSelected = "",
  quarterToggleButtonGroupName = "period-group",
  quarterToggleButtonLabel = "Quarter",
  toggleGroupDirection = "Horizontal",
  toggleGroupGroupName = "toggle-group-1",
  toggleGroupNumberOfButtons = "5",
  weekToggleButtonGroupName = "period-group",
  weekToggleButtonLabel = "Week",
  yearToggleButtonGroupName = "period-group",
  yearToggleButtonLabel = "Year",
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block className={"config-card"} tag={"div"}>
        <Block tag={"div"}>
          <Block className={"config-grid_col-2"} tag={"div"}>
            <Block className={"config_container"} tag={"div"}>
              <Block className={"config_selection"} tag={"div"}>
                <Block className={"config-input_container"} tag={"div"}>
                  <Block className={"config-input_wrapper"} tag={"div"}>
                    <Block className={"config-label_md"} tag={"div"}>
                      {metric1MetricLabel}
                    </Block>
                    {metric1ConfigMetricSlot}
                  </Block>
                  <Block className={"color-picker_container"} tag={"div"}>
                    <Block className={"color-picker_wrapper"} tag={"div"}>
                      <Block className={"color-picker_grid"} tag={"div"}>
                        <Block className={"config-label_xs"} tag={"div"}>
                          {"WEEkdaycolor"}
                        </Block>
                        {metric1Metric1WeekdayColor}
                      </Block>
                      <Block className={"color-picker_grid"} tag={"div"}>
                        <Block className={"config-label_xs"} tag={"div"}>
                          {"WEEkendcolor"}
                        </Block>
                        {metric1Metric1WeekendColor}
                      </Block>
                    </Block>
                  </Block>
                </Block>
                <Block className={"config-input_container"} tag={"div"}>
                  <Block className={"config-input_wrapper"} tag={"div"}>
                    <Block className={"config-label_md"} tag={"div"}>
                      {metric2MetricLabel}
                    </Block>
                    {metric2ConfigMetricSlot}
                  </Block>
                  <Block className={"color-picker_container"} tag={"div"}>
                    <Block className={"color-picker_wrapper"} tag={"div"}>
                      <Block className={"color-picker_grid"} tag={"div"}>
                        <Block className={"config-label_xs"} tag={"div"}>
                          {"WEEkdaycolor"}
                        </Block>
                        {metric2Metric2WeekdayColor}
                      </Block>
                      <Block className={"color-picker_grid"} tag={"div"}>
                        <Block className={"config-label_xs"} tag={"div"}>
                          {"WEEkendcolor"}
                        </Block>
                        {metric2Metric2WeekendColor}
                      </Block>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
            <Block className={"config_container"} tag={"div"}>
              <Block className={"config_wrapper"} tag={"div"}>
                <Block className={"config-period_container"} tag={"div"}>
                  <Block
                    className={"config-period_selection flex_vertical"}
                    tag={"div"}
                  >
                    <Block className={"config-period-label_md"} tag={"div"}>
                      {"Period"}
                    </Block>
                    <NotSupported
                      _atom={
                        "4411 Bcf 2 72 C 8 A 9 B 9 5 B 38 Da 82753 A 194 D"
                      }
                    />
                  </Block>
                  <Block className={"div-block-14"} tag={"div"}>
                    <Block
                      className={"config-period_selection"}
                      data-hide={"toggle-on"}
                      data-target={"date-input"}
                      tag={"div"}
                    >
                      <Block className={"config-period-label_xs"} tag={"div"}>
                        {"Relative From"}
                      </Block>
                      <Block
                        data-period-target={periodSelected}
                        id={"dynamic-date-period"}
                        tag={"div"}
                      >
                        <NotSupported
                          _atom={
                            "8203 E 33 C 0 D 9 F Fd 53 2 Dec Eaa 17 B 34 F 290"
                          }
                        />
                      </Block>
                    </Block>
                    <Block
                      className={"config_date-input"}
                      data-hide={"toggle-off"}
                      data-target={"date-input"}
                      tag={"div"}
                    >
                      <Block className={"date-connetor"} tag={"div"}>
                        {"from"}
                      </Block>
                      <NotSupported
                        _atom={
                          "5 Fece 08 C 4 B 71 Ca 81 Eb 44 848 Ec 98 A 1441"
                        }
                      />
                      <Block className={"date-connetor"} tag={"div"}>
                        {"to"}
                      </Block>
                      <NotSupported
                        _atom={
                          "5 Fece 08 C 4 B 71 Ca 81 Eb 44 848 Ec 98 A 1441"
                        }
                      />
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
          </Block>
          <Heading className={"config_headline"} tag={"h2"}>
            {cardHeadline}
          </Heading>
        </Block>
      </Block>
    </div>
  );
}
