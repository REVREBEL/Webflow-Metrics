import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function BudgetHoverCard(props: {
  budgetAdrAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetAdrIconTrendVisibility?: Types.Boolean.Boolean;
  budgetAdrLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetAdrMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetAdrVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetAdrVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetAdrVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetGrpAdrAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetGrpAdrIconTrendVisibility?: Types.Boolean.Boolean;
  budgetGrpAdrLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetGrpAdrMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetGrpAdrVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetGrpAdrVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetGrpAdrVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetGrpOccpAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetGrpOccpIconTrendVisibility?: Types.Boolean.Boolean;
  budgetGrpOccpLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetGrpOccpMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetGrpOccpVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetGrpOccpVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetGrpOccpVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetGrpRevenueAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetGrpRevenueIconTrendVisibility?: Types.Boolean.Boolean;
  budgetGrpRevenueLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetGrpRevenueMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetGrpRevenueVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetGrpRevenueVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetGrpRevenueVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetOccpAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetOccpIconTrendVisibility?: Types.Boolean.Boolean;
  budgetOccpLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetOccpMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetOccpVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetOccpVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetOccpVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetRevParAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetRevParIconTrendVisibility?: Types.Boolean.Boolean;
  budgetRevParLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetRevParMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetRevParVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetRevParVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetRevParVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetTrnAdrAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetTrnAdrIconTrendVisibility?: Types.Boolean.Boolean;
  budgetTrnAdrLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetTrnAdrMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetTrnAdrVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetTrnAdrVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetTrnAdrVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetTrnOccpAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetTrnOccpIconTrendVisibility?: Types.Boolean.Boolean;
  budgetTrnOccpLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetTrnOccpMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetTrnOccpVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetTrnOccpVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetTrnOccpVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  budgetTrnRevenueAbbreviatedMetric?: Types.Boolean.Boolean;
  budgetTrnRevenueIconTrendVisibility?: Types.Boolean.Boolean;
  budgetTrnRevenueLayout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  budgetTrnRevenueMetricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  budgetTrnRevenueVarianceLabelVisibility?: Types.Boolean.Boolean;
  budgetTrnRevenueVarianceMetricVisibility?: Types.Boolean.Boolean;
  budgetTrnRevenueVarianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
}): React.JSX.Element;
