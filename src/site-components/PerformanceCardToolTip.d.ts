import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function PerformanceCardToolTip(props: {
  /** Displays the ADR Variance to Budget 
        Var = Budget ADR - OTB -ADR
        $0.00*/
  adrAdrVarBudgetRuntimeProps?: Types.Devlink.RuntimeProps;
  /** Displays the ADR Variance to Budget 
        Var = Budget ADR - OTB -ADR
        $0.00*/
  adrAdrVarBudgetSlot?: Types.Devlink.Slot;
  /** $0.00*/
  adrTotalAdrotbRuntimeProps?: Types.Devlink.RuntimeProps;
  /** $0.00*/
  adrTotalAdrotbSlot?: Types.Devlink.Slot;
  adrTrnTotalAdrotbRuntimeProps?: Types.Devlink.RuntimeProps;
  adrTrnTotalAdrotbSlot?: Types.Devlink.Slot;
  revenueRevenueVarBudgetSlot?: Types.Devlink.RuntimeProps;
  /** Displays the Revenue Variance to Budget 
        Var = Budget Revenue - OTB Revenue*/
  revenueRevenueVarBudgetSlot2?: Types.Devlink.Slot;
  /** Displays the Revenue Variance to Budget 
        Var = Budget Revenue - OTB Revenue*/
  revenueTrnRevenueVarBudgetRuntimeProps?: Types.Devlink.Slot;
  /** Displays the Revenue Variance to Budget 
        Var = Budget Revenue - OTB Revenue*/
  revenueTrnRevenueVarBudgetSlot?: Types.Devlink.RuntimeProps;
  /** Total Revenue OTB
        $0 No Decimal*/
  revenueTrnTotalRevenueOtbMetricSlot?: Types.Devlink.Slot;
  /** Total Revenue OTB
        $0 No Decimal*/
  revenueTrnTotalRevenueOtbRuntimeProps?: Types.Devlink.RuntimeProps;
  roomsRoomsVarBudgetRuntimeProps?: Types.Devlink.RuntimeProps;
  /** Displays the Revenue Variance to Rooms 
        Var = Budget Rooms - OTB Rooms*/
  roomsRoomsVarBudgetSlot?: Types.Devlink.Slot;
  /** Total Rooms OTB*/
  roomsTotalRoomsOtbRuntimeProps?: Types.Devlink.RuntimeProps;
  /** Total Rooms OTB*/
  roomsTotalRoomsOtbSlot?: Types.Devlink.Slot;
  roomsTrnTotalRoomsOtbSlot?: Types.Devlink.Slot;
  totalRevenueOtbRuntimeProps?: Types.Devlink.RuntimeProps;
  totalRevenueOtbSlot?: Types.Devlink.Slot;
  trnTotalRoomsOtbRuntimeProps?: Types.Devlink.RuntimeProps;
}): React.JSX.Element;
