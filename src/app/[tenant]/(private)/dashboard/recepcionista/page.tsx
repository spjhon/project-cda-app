"use client";

import { useContext } from "react";

import NewEntryOrderComponent from "@/components/dashboard/recepcionista/NewEntryOrder/NewEntryOrderComponent";
import NewSimpleEntryOrderComponent from "@/components/dashboard/recepcionista/NewEntryOrder/NewSimpleEntryOrderComponent";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";


export default function NewEntryOrderPage() {
  const permissionsContext = useContext(PermissionsContext);

  const tenantModules =
    permissionsContext?.PermissionsContextValue.tenantModules ?? [];

  const hasFullInfoModule = tenantModules.some(
    (module) =>
      module.code === "full_info_module" &&
      module.is_enabled
  );

  return hasFullInfoModule
    ? <NewEntryOrderComponent />
    : <NewSimpleEntryOrderComponent />;
}