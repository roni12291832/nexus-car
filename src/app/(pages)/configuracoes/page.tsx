"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Settings from "./_componentes/system-config";
import AgentConfigPage from "./_componentes/config-agente";

export default function Page() {
  const [activeTab, setActiveTab] = useState("board");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="board">Sistema</TabsTrigger>
          <TabsTrigger value="automation">Agente</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <Settings />
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <AgentConfigPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
