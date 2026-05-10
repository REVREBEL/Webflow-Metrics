"use client";
import React from "react";
import _styles from "./css/classes.module.css";
import * as _utils from "./webflow_modules/utils";
import Block from "./webflow_modules/Basic/components/Block";
import Heading from "./webflow_modules/Basic/components/Heading";
import HFlex from "./webflow_modules/Layout/components/HFlex";
import { MetricType } from "./MetricType";

export function BudgetHoverCard({
  budgetAdrAbbreviatedMetric = false,
  budgetAdrIconTrendVisibility = true,
  budgetAdrLayout = "Horizontal 1row",
  budgetAdrMetricType = "ADR",
  budgetAdrVarianceLabelVisibility = true,
  budgetAdrVarianceMetricVisibility = true,
  budgetAdrVarianceType = "to book",
  budgetGrpAdrAbbreviatedMetric = false,
  budgetGrpAdrIconTrendVisibility = true,
  budgetGrpAdrLayout = "Base",
  budgetGrpAdrMetricType = "ADR",
  budgetGrpAdrVarianceLabelVisibility = true,
  budgetGrpAdrVarianceMetricVisibility = true,
  budgetGrpAdrVarianceType = "var",
  budgetGrpOccpAbbreviatedMetric = false,
  budgetGrpOccpIconTrendVisibility = true,
  budgetGrpOccpLayout = "Base",
  budgetGrpOccpMetricType = "Occupancy",
  budgetGrpOccpVarianceLabelVisibility = true,
  budgetGrpOccpVarianceMetricVisibility = true,
  budgetGrpOccpVarianceType = "var",
  budgetGrpRevenueAbbreviatedMetric = false,
  budgetGrpRevenueIconTrendVisibility = true,
  budgetGrpRevenueLayout = "Base",
  budgetGrpRevenueMetricType = "Revenue",
  budgetGrpRevenueVarianceLabelVisibility = true,
  budgetGrpRevenueVarianceMetricVisibility = true,
  budgetGrpRevenueVarianceType = "var",
  budgetOccpAbbreviatedMetric = false,
  budgetOccpIconTrendVisibility = true,
  budgetOccpLayout = "Horizontal 1row",
  budgetOccpMetricType = "Occupancy",
  budgetOccpVarianceLabelVisibility = true,
  budgetOccpVarianceMetricVisibility = true,
  budgetOccpVarianceType = "to book",
  budgetRevParAbbreviatedMetric = false,
  budgetRevParIconTrendVisibility = true,
  budgetRevParLayout = "Horizontal 1row",
  budgetRevParMetricType = "Revenue",
  budgetRevParVarianceLabelVisibility = true,
  budgetRevParVarianceMetricVisibility = true,
  budgetRevParVarianceType = "to book",
  budgetTrnAdrAbbreviatedMetric = false,
  budgetTrnAdrIconTrendVisibility = true,
  budgetTrnAdrLayout = "Base",
  budgetTrnAdrMetricType = "ADR",
  budgetTrnAdrVarianceLabelVisibility = true,
  budgetTrnAdrVarianceMetricVisibility = true,
  budgetTrnAdrVarianceType = "var",
  budgetTrnOccpAbbreviatedMetric = false,
  budgetTrnOccpIconTrendVisibility = true,
  budgetTrnOccpLayout = "Base",
  budgetTrnOccpMetricType = "Occupancy",
  budgetTrnOccpVarianceLabelVisibility = true,
  budgetTrnOccpVarianceMetricVisibility = true,
  budgetTrnOccpVarianceType = "var",
  budgetTrnRevenueAbbreviatedMetric = false,
  budgetTrnRevenueIconTrendVisibility = true,
  budgetTrnRevenueLayout = "Base",
  budgetTrnRevenueMetricType = "Revenue",
  budgetTrnRevenueVarianceLabelVisibility = true,
  budgetTrnRevenueVarianceMetricVisibility = true,
  budgetTrnRevenueVarianceType = "var",
}) {
  return (
    <Block
      className={_utils.cx(
        _styles,
        "card",
        "add-shadow",
        "bg-color-light-1",
        "text-color-primary"
      )}
      tag={"div"}
    >
      <Block
        className={_utils.cx(_styles, "card-body", "bg-color-light-1")}
        tag={"div"}
      >
        <HFlex
          className={_utils.cx(
            _styles,
            "flex-block",
            "is-stacked",
            "is-max-height",
            "is-gap-row_1rem",
            "padding-xs"
          )}
          tag={"div"}
        >
          <Heading
            className={_utils.cx(_styles, "metric-headline", "is-underline")}
            tag={"h1"}
          >
            {"Budget Reach"}
          </Heading>
          <MetricType
            abbreviatedMetric={budgetOccpAbbreviatedMetric}
            iconTrendVisibility={budgetOccpIconTrendVisibility}
            layout={budgetOccpLayout}
            metricType={budgetOccpMetricType}
            varianceLabelVisibility={budgetOccpVarianceLabelVisibility}
            varianceMetricVisibility={budgetOccpVarianceMetricVisibility}
            varianceType={budgetOccpVarianceType}
          />
          <MetricType
            abbreviatedMetric={budgetAdrAbbreviatedMetric}
            iconTrendVisibility={budgetAdrIconTrendVisibility}
            layout={budgetAdrLayout}
            metricType={budgetAdrMetricType}
            varianceLabelVisibility={budgetAdrVarianceLabelVisibility}
            varianceMetricVisibility={budgetAdrVarianceMetricVisibility}
            varianceType={budgetAdrVarianceType}
          />
          <MetricType
            abbreviatedMetric={budgetRevParAbbreviatedMetric}
            iconTrendVisibility={budgetRevParIconTrendVisibility}
            layout={budgetRevParLayout}
            metricType={budgetRevParMetricType}
            varianceLabelVisibility={budgetRevParVarianceLabelVisibility}
            varianceMetricVisibility={budgetRevParVarianceMetricVisibility}
            varianceType={budgetRevParVarianceType}
          />
        </HFlex>
        <Block className={_utils.cx(_styles, "inline-flex")} tag={"div"}>
          <HFlex
            className={_utils.cx(
              _styles,
              "flex-block",
              "is-stacked",
              "padding-xs"
            )}
            tag={"div"}
          >
            <Heading
              className={_utils.cx(
                _styles,
                "metric-headline",
                "is-secondary",
                "is-underline"
              )}
              tag={"h1"}
            >
              {"Transient"}
            </Heading>
            <MetricType
              abbreviatedMetric={budgetTrnOccpAbbreviatedMetric}
              iconTrendVisibility={budgetTrnOccpIconTrendVisibility}
              layout={budgetTrnOccpLayout}
              metricType={budgetTrnOccpMetricType}
              varianceLabelVisibility={budgetTrnOccpVarianceLabelVisibility}
              varianceMetricVisibility={budgetTrnOccpVarianceMetricVisibility}
              varianceType={budgetTrnOccpVarianceType}
            />
            <MetricType
              abbreviatedMetric={budgetTrnAdrAbbreviatedMetric}
              iconTrendVisibility={budgetTrnAdrIconTrendVisibility}
              layout={budgetTrnAdrLayout}
              metricType={budgetTrnAdrMetricType}
              varianceLabelVisibility={budgetTrnAdrVarianceLabelVisibility}
              varianceMetricVisibility={budgetTrnAdrVarianceMetricVisibility}
              varianceType={budgetTrnAdrVarianceType}
            />
            <MetricType
              abbreviatedMetric={budgetTrnRevenueAbbreviatedMetric}
              iconTrendVisibility={budgetTrnRevenueIconTrendVisibility}
              layout={budgetTrnRevenueLayout}
              metricType={budgetTrnRevenueMetricType}
              varianceLabelVisibility={budgetTrnRevenueVarianceLabelVisibility}
              varianceMetricVisibility={
                budgetTrnRevenueVarianceMetricVisibility
              }
              varianceType={budgetTrnRevenueVarianceType}
            />
          </HFlex>
          <HFlex
            className={_utils.cx(
              _styles,
              "flex-block",
              "is-stacked",
              "padding-xs"
            )}
            tag={"div"}
          >
            <Heading
              className={_utils.cx(
                _styles,
                "metric-headline",
                "is-secondary",
                "is-underline"
              )}
              tag={"h1"}
            >
              {"Group"}
            </Heading>
            <MetricType
              abbreviatedMetric={budgetGrpOccpAbbreviatedMetric}
              iconTrendVisibility={budgetGrpOccpIconTrendVisibility}
              layout={budgetGrpOccpLayout}
              metricType={budgetGrpOccpMetricType}
              varianceLabelVisibility={budgetGrpOccpVarianceLabelVisibility}
              varianceMetricVisibility={budgetGrpOccpVarianceMetricVisibility}
              varianceType={budgetGrpOccpVarianceType}
            />
            <MetricType
              abbreviatedMetric={budgetGrpAdrAbbreviatedMetric}
              iconTrendVisibility={budgetGrpAdrIconTrendVisibility}
              layout={budgetGrpAdrLayout}
              metricType={budgetGrpAdrMetricType}
              varianceLabelVisibility={budgetGrpAdrVarianceLabelVisibility}
              varianceMetricVisibility={budgetGrpAdrVarianceMetricVisibility}
              varianceType={budgetGrpAdrVarianceType}
            />
            <MetricType
              abbreviatedMetric={budgetGrpRevenueAbbreviatedMetric}
              iconTrendVisibility={budgetGrpRevenueIconTrendVisibility}
              layout={budgetGrpRevenueLayout}
              metricType={budgetGrpRevenueMetricType}
              varianceLabelVisibility={budgetGrpRevenueVarianceLabelVisibility}
              varianceMetricVisibility={
                budgetGrpRevenueVarianceMetricVisibility
              }
              varianceType={budgetGrpRevenueVarianceType}
            />
          </HFlex>
        </Block>
      </Block>
    </Block>
  );
}
