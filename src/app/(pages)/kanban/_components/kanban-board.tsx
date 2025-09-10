"use client";

import { useState, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import Column from "./column";

import AutomationRules from "./automation-rules";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type {
  Task,
  Column as ColumnType,
  Rule,
  RuleCondition,
  RuleAction,
} from "../../../../../types/kanban";

import { toast } from "sonner";
import TaskDetailSidebar from "./task-detail-sidebar";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";

export default function KanbanBoard() {
  const { user } = useAuth();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTab, setActiveTab] = useState("board");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Busca colunas
      const { data: columnsData, error: colErr } = await supabase
        .from("columns")
        .select("id, title, color");
      if (colErr) {
        console.error("Erro ao buscar colunas:", colErr);
        return;
      }

      // 2. Busca tasks relacionadas
      const { data: tasksData, error: taskErr } = await supabase
        .from("tasks")
        .select(
          `
        id, title, description, status, due_date, created_at, column_id,
        subtasks ( id, title, completed ),
        custom_fields ( id, name, value )
      `
        );
      if (taskErr) {
        console.error("Erro ao buscar tasks:", taskErr);
        return;
      }

      // 3. Monta estrutura Column[] com tasks
      const mappedColumns: ColumnType[] =
        columnsData?.map((col) => ({
          id: col.id!,
          title: col.title!,
          color: col.color ?? undefined,
          tasks:
            tasksData
              ?.filter((t) => t.column_id === col.id)
              .map((t) => ({
                id: t.id!,
                title: t.title!,
                description: t.description ?? "",
                status: t.status!,
                dueDate: t.due_date ?? null,
                createdAt: t.created_at!,
                columnId: t.column_id!,
                subtasks: t.subtasks ?? [],
                customFields: t.custom_fields ?? [],
              })) ?? [],
        })) ?? [];

      setColumns(mappedColumns);

      // 4. Busca regras
      const { data: rulesData, error: ruleErr } = await supabase
        .from("rules")
        .select(
          `
        id, name, enabled,
        rule_conditions ( id, type, field, operator, value ),
        rule_actions ( id, type, target_column_id )
      `
        );

      if (ruleErr) {
        console.error("Erro ao buscar regras:", ruleErr);
        return;
      }

      // 5. Monta estrutura Rule[]
      const mappedRules: Rule[] =
        rulesData?.map((rule) => {
          const conditionData = rule.rule_conditions?.[0];
          const actionData = rule.rule_actions?.[0];

          // Define condition default seguro
          const condition: RuleCondition = conditionData
            ? {
                type: conditionData.type ?? "custom-field",
                field: conditionData.field ?? undefined,
                operator: conditionData.operator ?? "equals",
                value: conditionData.value ?? undefined,
              }
            : {
                type: "custom-field",
                operator: "equals",
              };

          // Define action default seguro
          const action: RuleAction = actionData
            ? {
                type: actionData.type ?? "move-to-column",
                targetColumnId:
                  actionData.target_column_id ??
                  mappedColumns[0]?.id ??
                  "default-column-id",
              }
            : {
                type: "move-to-column",
                targetColumnId: mappedColumns[0]?.id ?? "default-column-id",
              };

          return {
            id: rule.id,
            name: rule.name ?? "Untitled Rule",
            enabled: rule.enabled ?? true,
            condition,
            action,
          };
        }) ?? [];

      setRules(mappedRules);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (rules.length === 0) return;

    const enabledRules = rules.filter((rule) => rule.enabled);
    if (enabledRules.length === 0) return;

    const tasksToMove: {
      taskId: string;
      sourceColumnId: string;
      targetColumnId: string;
    }[] = [];

    columns.forEach((column) => {
      column.tasks.forEach((task) => {
        enabledRules.forEach((rule) => {
          const { condition, action } = rule;
          let conditionMet = false;

          if (
            condition.type === "due-date" &&
            condition.operator === "is-overdue"
          ) {
            conditionMet = Boolean(
              task.dueDate &&
                new Date(task.dueDate) < new Date() &&
                task.status !== "Completed"
            );
          } else if (
            condition.type === "subtasks-completed" &&
            condition.operator === "all-completed"
          ) {
            conditionMet =
              task.subtasks.length > 0 &&
              task.subtasks.every((subtask) => subtask.completed);
          }

          // Condição: custom field
          else if (condition.type === "custom-field" && condition.field) {
            const field = task.customFields.find(
              (f) => f.name === condition.field
            );
            if (field) {
              if (condition.operator === "equals") {
                conditionMet = field.value === condition.value;
              } else if (condition.operator === "not-equals") {
                conditionMet = field.value !== condition.value;
              } else if (condition.operator === "contains") {
                conditionMet = field.value.includes(condition.value || "");
              }
            }
          }

          if (
            conditionMet &&
            action.type === "move-to-column" &&
            column.id &&
            action.targetColumnId
          ) {
            const targetColumn = columns.find(
              (col) => col.id === action.targetColumnId
            );
            if (targetColumn && task.status !== targetColumn.title) {
              tasksToMove.push({
                taskId: task.id!,
                sourceColumnId: column.id, // agora string garantido
                targetColumnId: action.targetColumnId, // agora string garantido
              });
            }
          }
        });
      });
    });

    // Aplica os movimentos
    if (tasksToMove.length > 0) {
      const applyMoves = async () => {
        const newColumns = [...columns];

        for (const { taskId, sourceColumnId, targetColumnId } of tasksToMove) {
          const sourceColIndex = newColumns.findIndex(
            (col) => col.id === sourceColumnId
          );
          const targetColIndex = newColumns.findIndex(
            (col) => col.id === targetColumnId
          );

          if (sourceColIndex !== -1 && targetColIndex !== -1) {
            const sourceCol = newColumns[sourceColIndex];
            const taskIndex = sourceCol.tasks.findIndex((t) => t.id === taskId);

            if (taskIndex !== -1) {
              const task = {
                ...sourceCol.tasks[taskIndex],
                status: newColumns[targetColIndex].title,
              };

              // 1. Atualiza no Supabase
              const { error } = await supabase
                .from("tasks")
                .update({
                  column_id: targetColumnId,
                  status: newColumns[targetColIndex].title,
                })
                .eq("id", taskId);

              if (error) {
                console.error("Erro ao mover task:", error);
                continue; // não aplica no estado se falhar
              }

              // 2. Remove da coluna origem
              newColumns[sourceColIndex] = {
                ...sourceCol,
                tasks: sourceCol.tasks.filter((t) => t.id !== taskId),
              };

              // 3. Adiciona na coluna destino
              newColumns[targetColIndex] = {
                ...newColumns[targetColIndex],
                tasks: [...newColumns[targetColIndex].tasks, task],
              };

              // 4. Atualiza task selecionada (se for a que foi movida)
              if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(task);
              }

              toast("Task movida automaticamente");
            }
          }
        }

        setColumns(newColumns);
      };

      applyMoves();
    }
  }, [columns, rules, selectedTask]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Colunas de origem e destino
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    // Clonar colunas
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Task sendo movida
    const task = sourceColumn.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Atualizar no Supabase primeiro
    const updatedTask = {
      ...task,
      status: destColumn.title,
    };

    const { error } = await supabase
      .from("tasks")
      .update({
        column_id: destColumn.id, // id real da coluna
        status: destColumn.title, // opcional, se quiser manter coerência com o título
      })
      .eq("id", draggableId);

    if (error) {
      console.error("Erro ao atualizar task:", error);
      toast.error("Erro ao mover task");
      return; // não altera local se falhar no Supabase
    }

    // Remover da coluna origem
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      tasks: sourceColumn.tasks.filter((t) => t.id !== draggableId),
    };

    // Inserir na coluna destino
    newColumns[destColIndex] = {
      ...destColumn,
      tasks: [
        ...destColumn.tasks.slice(0, destination.index),
        updatedTask,
        ...destColumn.tasks.slice(destination.index),
      ],
    };

    setColumns(newColumns);

    // Atualizar selectedTask se necessário
    if (selectedTask && selectedTask.id === draggableId) {
      setSelectedTask(updatedTask);
    }

    toast.success("Task movida com sucesso");
  };

  const addTask = async (columnId: string, task: Task) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.dueDate,
          created_at: task.createdAt,
          column_id: columnId,
        },
      ])
      .select(
        `
        id, title, description, status, due_date, created_at, column_id,
        subtasks ( id, title, completed ),
        custom_fields ( id, name, value )
      `
      )
      .single();

    if (error) {
      console.error("Erro ao criar task:", error);
      toast.error("Erro ao criar task");
      return;
    }

    // Atualiza estado local com task do banco (garante consistência)
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: [
            ...column.tasks,
            {
              id: data.id,
              title: data.title,
              description: data.description,
              status: data.status,
              dueDate: data.due_date,
              createdAt: data.created_at,
              subtasks: data.subtasks ?? [],
              customFields: data.custom_fields ?? [],
              columnId: data.column_id!,
            },
          ],
        };
      }
      return column;
    });

    setColumns(newColumns);
    toast.success("Task criada com sucesso");
  };

  const updateTask = async (updatedTask: Task, columnId: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Atualiza no Supabase
    const { error } = await supabase
      .from("tasks")
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        due_date: updatedTask.dueDate,
        column_id: columnId, // 🔑 usa o columnId passado como parâmetro
      })
      .eq("id", updatedTask.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao atualizar task:", error);
      toast.error("Erro ao atualizar task");
      return;
    }

    // Atualiza estado local
    const newColumns = columns.map((column) => {
      return {
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === updatedTask.id
            ? {
                ...updatedTask,
                status:
                  columns.find((c) => c.id === columnId)?.title ??
                  updatedTask.status,
              }
            : task
        ),
      };
    });

    setColumns(newColumns);
    setSelectedTask({
      ...updatedTask,
      status:
        columns.find((c) => c.id === columnId)?.title ?? updatedTask.status,
    });
    toast.success("Task atualizada com sucesso ");
  };

  const deleteTask = async (taskId: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao deletar task:", error);
      toast.error("Erro ao deletar task");
      return;
    }

    // Atualiza estado local
    const newColumns = columns.map((column) => {
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      };
    });

    setColumns(newColumns);
    setSelectedTask(null);
    toast.success("Task deletada com sucesso");
  };

  const duplicateTask = async (task: Task, columnId?: string) => {
    const duplicatedTask: Task = {
      ...task,
      title: `${task.title} (Copia)`,
      createdAt: new Date().toISOString(),
    };

    const targetColumnId =
      columnId ||
      columns.find((col) => col.tasks.some((t) => t.id === task.id))?.id;

    if (!targetColumnId) {
      toast.error("Erro ao duplicar task: coluna não encontrada");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { error } = await supabase.from("tasks").insert([
      {
        column_id: targetColumnId,
        user_id: user.id,
        title: duplicatedTask.title,
        description: duplicatedTask.description,
        status: duplicatedTask.status,
        due_date: duplicatedTask.dueDate,
        created_at: duplicatedTask.createdAt,
      },
    ]);

    if (error) {
      console.error("Erro ao duplicar task:", error);
      toast.error("Erro ao duplicar task");
      return;
    }

    addTask(targetColumnId, duplicatedTask);
    toast.success("Task duplicada com sucesso");
  };

  const addColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast.error("Título da coluna é obrigatório");
      return;
    }

    const newColumn: ColumnType = {
      title: newColumnTitle,
      tasks: [],
    };

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { data, error } = await supabase
      .from("columns")
      .insert([
        {
          user_id: user.id,
          title: newColumn.title,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar coluna:", error);
      toast.error("Erro ao criar coluna");
      return;
    }

    setColumns([...columns, { ...newColumn, id: data.id }]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
    toast.success("Coluna criada com sucesso");
  };

  const updateColumn = async (
    columnId: string,
    updates: Partial<ColumnType>
  ) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const { data, error } = await supabase
      .from("columns")
      .update({
        title: updates.title,
        color: updates.color,
      })
      .eq("id", columnId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao atualizar coluna:", error);
      toast.error("Erro ao atualizar coluna");
      return;
    }

    const newColumns = columns.map((column) =>
      column.id === columnId
        ? {
            ...column,
            ...updates,
            id: (data?.[0] as { id: string } | undefined)?.id ?? column.id, // ✅ cast seguro
          }
        : column
    );

    setColumns(newColumns);
    toast.success("Coluna atualizada com sucesso");
  };

  const deleteColumn = async (columnId: string) => {
    // Verifica se a coluna existe
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      toast.error("Coluna não encontrada");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao deletar coluna:", error);
      toast.error("Erro ao deletar coluna");
      return;
    }

    setColumns(columns.filter((col) => col.id !== columnId));
    toast.success("Coluna e tasks relacionadas deletadas com sucesso");
  };

  const addRule = async (rule: Rule) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { data: ruleData, error: ruleError } = await supabase
      .from("rules")
      .insert([
        {
          user_id: user.id, // 🔑 garante multiusuário
          name: rule.name,
          enabled: rule.enabled,
        },
      ])
      .select()
      .single();

    if (ruleError) {
      console.error("Erro ao criar regra:", ruleError);
      toast.error("Erro ao criar regra");
      return;
    }

    if (rule.condition) {
      const { error: conditionError } = await supabase
        .from("rule_conditions")
        .insert([
          {
            user_id: user.id,
            rule_id: ruleData.id,
            type: rule.condition.type,
            field: rule.condition.field ?? null,
            operator: rule.condition.operator,
            value: rule.condition.value ?? null,
          },
        ]);

      if (conditionError) {
        console.error("Erro ao criar condição da regra:", conditionError);
        toast.error("Erro ao criar regra");
        return;
      }
    }

    if (rule.action) {
      const { error: actionError } = await supabase
        .from("rule_actions")
        .insert([
          {
            user_id: user.id,
            rule_id: ruleData.id,
            type: rule.action.type,
            target_column_id: rule.action.targetColumnId,
          },
        ]);

      if (actionError) {
        console.error("Erro ao criar ação da regra:", actionError);
        toast.error("Erro ao criar regra");
        return;
      }
    }

    setRules([...rules, rule]);
    toast.success("Regra criada com sucesso");
  };

  const updateRule = async (ruleId: string, updates: Partial<Rule>) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { error: ruleError } = await supabase
      .from("rules")
      .update({
        name: updates.name,
        enabled: updates.enabled,
      })
      .eq("id", ruleId)
      .eq("user_id", user.id);

    if (ruleError) {
      console.error("Erro ao atualizar regra:", ruleError);
      toast.error("Erro ao atualizar regra");
      return;
    }

    // Atualiza condição, se houver
    if (updates.condition) {
      const { error: conditionError } = await supabase
        .from("rule_conditions")
        .update({
          type: updates.condition.type,
          field: updates.condition.field ?? null,
          operator: updates.condition.operator,
          value: updates.condition.value ?? null,
        })
        .eq("rule_id", ruleId)
        .eq("user_id", user.id);

      if (conditionError) {
        console.error("Erro ao atualizar condição da regra:", conditionError);
        toast.error("Erro ao atualizar regra");
        return;
      }
    }

    // Atualiza ação, se houver
    if (updates.action) {
      const { error: actionError } = await supabase
        .from("rule_actions")
        .update({
          type: updates.action.type,
          target_column_id: updates.action.targetColumnId,
        })
        .eq("rule_id", ruleId)
        .eq("user_id", user.id);

      if (actionError) {
        console.error("Erro ao atualizar ação da regra:", actionError);
        toast.error("Erro ao atualizar regra");
        return;
      }
    }

    // Atualiza estado local
    const newRules = rules.map((rule) =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );

    setRules(newRules);
    toast.success("Regra atualizada com sucesso");
  };

  const deleteRule = async (ruleId: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    const { error } = await supabase
      .from("rules")
      .delete()
      .eq("id", ruleId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao deletar regra:", error);
      toast.error("Erro ao deletar regra");
      return;
    }

    setRules(rules.filter((rule) => rule.id !== ruleId));
    toast.success("Regra deletada com sucesso");
  };

  const renderBoardContent = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={addTask}
            onTaskClick={setSelectedTask}
            onDeleteColumn={() => deleteColumn(column.id!)}
            onUpdateColumn={updateColumn}
            onDuplicateTask={duplicateTask}
          />
        ))}

        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border dark:border-gray-700">
              <Label htmlFor="column-title" className="dark:text-gray-200 mb-1">
                Nome da Coluna
              </Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Adicionar nome da coluna"
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addColumn}>
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingColumn(false)}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-2 w-full h-12 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  );

  const renderAutomationContent = () => (
    <div>
      <AutomationRules
        rules={rules}
        columns={columns}
        onAddRule={addRule}
        onUpdateRule={updateRule}
        onDeleteRule={deleteRule}
      />
    </div>
  );

  return (
    <div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="board">Quadro</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            {renderBoardContent()}
          </TabsContent>

          <TabsContent value="automation" className="mt-4">
            {renderAutomationContent()}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(task) => updateTask(task, task.columnId!)}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          columns={columns}
        />
      )}
    </div>
  );
}
