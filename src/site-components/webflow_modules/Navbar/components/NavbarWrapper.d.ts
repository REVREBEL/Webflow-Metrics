import * as React from "react";
import { NavbarConfig } from "../helpers/navbarContext";
import { Props } from "../../types";
type NavbarProps = Props<
  "div",
  {
    tag: React.ElementType;
    config: NavbarConfig;
  }
>;
export type { NavbarProps };
declare const NavbarWrapper: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    tag: React.ElementType;
    config: NavbarConfig;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default NavbarWrapper;
