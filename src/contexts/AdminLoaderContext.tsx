"use client";

import { AdminAnalyticsData, AdminAnalyticsDiaryData } from "@/app/[tenant]/dashboard/admin/layout";
import { createContext, ReactNode, use } from "react";

interface AdminLoaderContext {
  children: ReactNode;
  rol: string;
  adminAnalyticsPromise: Promise<AdminAnalyticsData>;
  adminAnalyticsDiaryPromise: Promise<AdminAnalyticsDiaryData>;

}

export interface AdminContextType {
  AdminContextValue: {
    rol: string;
    analyticsData: AdminAnalyticsData;
    analyticsDataDiary: AdminAnalyticsDiaryData;
  },
  
}

export const AdminContext = createContext<AdminContextType | null>(null);

export default function ReceptionistLoaderContext({
  rol,
  children,
  adminAnalyticsPromise ,
  adminAnalyticsDiaryPromise
}: AdminLoaderContext) {




 const analyticsData = use(adminAnalyticsPromise);
 const analyticsDataDiary = use(adminAnalyticsDiaryPromise)








  const AdminContextValue = {
    rol: rol,
    analyticsData: analyticsData,
    analyticsDataDiary: analyticsDataDiary
  };

  return (
    <AdminContext.Provider value={{ AdminContextValue }}>
      {children}
    </AdminContext.Provider>
  );
}
