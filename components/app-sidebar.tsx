"use client"

import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CryptoNews } from "@/components/crypto-news"
import { ForexNewsFeed } from "@/components/forex-news-feed"
import { CalendarDays, Newspaper } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      className="border-l border-zinc-800/60 bg-[#0D1117]"
    >
      {/* Header */}
      <SidebarHeader className="shrink-0 bg-[#0D1117] border-b border-zinc-800/60 p-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/25">
            <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Fundamental Panel</span>
        </div>
      </SidebarHeader>

      {/* Content dengan shadcn Tabs */}
      <SidebarContent className="flex-1 min-h-0 overflow-hidden bg-[#0D1117] p-0">
        <SidebarGroup className="p-0 h-full flex flex-col">
          <SidebarGroupContent className="flex-1 min-h-0 h-full">
            <Tabs
              defaultValue="calendar"
              className="h-full flex flex-col"
            >
              {/* Tab Switcher — pakai variant "line" agar cocok dengan tema dark */}
              <TabsList
                variant="line"
                className="w-full rounded-none border-b border-zinc-800/60 bg-transparent px-0 h-9 shrink-0 justify-start gap-0"
              >
                <TabsTrigger
                  value="calendar"
                  className="flex-1 gap-1.5 rounded-none text-xs data-active:text-amber-400 data-active:border-b-amber-500 data-active:after:bg-amber-500 text-zinc-500 hover:text-zinc-300 h-full"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Kalender Event
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  className="flex-1 gap-1.5 rounded-none text-xs data-active:text-amber-400 data-active:border-b-amber-500 data-active:after:bg-amber-500 text-zinc-500 hover:text-zinc-300 h-full"
                >
                  <Newspaper className="h-3.5 w-3.5" />
                  Live News
                </TabsTrigger>
              </TabsList>

              {/* Tab Panels */}
              <TabsContent
                value="calendar"
                className="flex-1 min-h-0 mt-0"
              >
                <CryptoNews />
              </TabsContent>

              <TabsContent
                value="news"
                className="flex-1 min-h-0 mt-0"
              >
                <ForexNewsFeed />
              </TabsContent>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
