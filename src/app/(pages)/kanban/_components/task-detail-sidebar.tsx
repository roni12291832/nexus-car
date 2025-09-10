"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  Edit,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Task,
  Column,
  Subtask,
  CustomField,
} from "../../../../../types/kanban";
import { formatDate } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/server";

interface TaskDetailSidebarProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  columns: Column[];
}

export default function TaskDetailSidebar({
  task,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
}: TaskDetailSidebarProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newCustomFieldName, setNewCustomFieldName] = useState("");
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("");
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const { user } = useAuth();

  const handleTitleSave = () => {
    if (editedTask.title.trim()) {
      onUpdate(editedTask);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionSave = () => {
    onUpdate(editedTask);
    setIsEditingDescription(false);
  };

  const handleStatusChange = (status: string) => {
    const updatedTask = { ...editedTask, status };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedTask = {
      ...editedTask,
      dueDate: date ? date.toISOString() : null,
    };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    if (!user) {
      toast("Usuário não autenticado");
      return;
    }

    const newSubtask: Subtask = {
      title: newSubtaskTitle,
      completed: false,
    };

    // Salva no Supabase
    const { error } = await supabase.from("subtasks").insert([
      {
        task_id: editedTask.id,
        user_id: user.id,
        title: newSubtask.title,
        completed: newSubtask.completed,
      },
    ]);

    if (error) {
      console.error("Erro ao criar subtask:", error);
      toast("Erro ao criar subtask");
      return;
    }

    // Atualiza estado local
    const updatedTask = {
      ...editedTask,
      subtasks: [...editedTask.subtasks, newSubtask],
    };

    setEditedTask(updatedTask);
    onUpdate(updatedTask);
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
    toast("Subtask criada com sucesso ✅");
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!user) {
      toast("Usuário não autenticado");
      return;
    }

    const { error } = await supabase
      .from("subtasks")
      .delete()
      .eq("id", subtaskId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao deletar subtask:", error);
      toast("Erro ao deletar subtask");
      return;
    }

    // Atualiza estado local
    const updatedSubtasks = editedTask.subtasks.filter(
      (subtask) => subtask.id !== subtaskId
    );

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
    toast("Subtask deletada com sucesso 🗑️");
  };

  const addCustomField = async () => {
    if (!newCustomFieldName.trim()) return;
    if (!user) {
      toast("Usuário não autenticado");
      return;
    }

    const newField: CustomField = {
      name: newCustomFieldName,
      value: newCustomFieldValue,
    };

    // Salva no Supabase
    const { error } = await supabase.from("custom_fields").insert([
      {
        task_id: editedTask.id,
        user_id: user.id,
        name: newField.name,
        value: newField.value,
      },
    ]);

    if (error) {
      console.error("Erro ao criar custom field:", error);
      toast("Erro ao criar custom field");
      return;
    }

    // Atualiza estado local
    const updatedTask = {
      ...editedTask,
      customFields: [...editedTask.customFields, newField],
    };

    setEditedTask(updatedTask);
    onUpdate(updatedTask);
    setNewCustomFieldName("");
    setNewCustomFieldValue("");
    setIsAddingCustomField(false);
    toast("Campo personalizado criado com sucesso ✅");
  };

  const updateCustomField = async (fieldId: string, value: string) => {
    if (!user) {
      toast("Usuário não autenticado");
      return;
    }

    // Atualiza no Supabase
    const { error } = await supabase
      .from("custom_fields")
      .update({ value })
      .eq("id", fieldId)
      .eq("user_id", user.id); // 🔑 garante multiusuário

    if (error) {
      console.error("Erro ao atualizar custom field:", error);
      toast("Erro ao atualizar campo personalizado");
      return;
    }

    // Atualiza estado local
    const updatedFields = editedTask.customFields.map((field) =>
      field.id === fieldId ? { ...field, value } : field
    );

    const updatedTask = { ...editedTask, customFields: updatedFields };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
    toast("Campo personalizado atualizado ✅");
  };

  const deleteCustomField = async (fieldId: string) => {
    if (!user) {
      toast("Usuário não autenticado");
      return;
    }

    // Deleta no Supabase
    const { error } = await supabase
      .from("custom_fields")
      .delete()
      .eq("id", fieldId)
      .eq("user_id", user.id); // 🔑 garante multiusuário

    if (error) {
      console.error("Erro ao deletar custom field:", error);
      toast("Erro ao deletar campo personalizado");
      return;
    }

    // Atualiza estado local
    const updatedFields = editedTask.customFields.filter(
      (field) => field.id !== fieldId
    );

    const updatedTask = { ...editedTask, customFields: updatedFields };
    setEditedTask(updatedTask);
    onUpdate(updatedTask);
  };

  const handleDeleteTask = () => {
    onDelete(task.id!);
  };

  const handleDuplicateTask = () => {
    onDuplicate(task);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg border-l dark:border-gray-700 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-gray-200">Detalhes</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                  className="text-lg font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleTitleSave}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingTitle(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium dark:text-gray-200">
                  {editedTask.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Status
            </Label>
            <Select
              value={editedTask.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.title}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Data limite
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editedTask.dueDate ? (
                    formatDate(editedTask.dueDate)
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
                align="start"
              >
                <CalendarComponent
                  mode="single"
                  locale={ptBR}
                  selected={
                    editedTask.dueDate
                      ? new Date(editedTask.dueDate)
                      : undefined
                  }
                  onSelect={handleDueDateChange}
                  className="dark:bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição
              </label>
              {!isEditingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Edit className="h-3 w-3 mr-1" /> Editar
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a description..."
                  rows={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md min-h-[60px]">
                {editedTask.description || "No description provided."}
              </div>
            )}
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtarefas
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingSubtask(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {isAddingSubtask && (
              <div className="mb-3 space-y-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Título da subtarefa"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addSubtask}>
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingSubtask(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedTask.subtasks.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sem subtarefas ainda.
                </p>
              ) : (
                editedTask.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-2"
                        onClick={() => toggleSubtask(subtask.id!)}
                      >
                        {subtask.completed ? (
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                      <span
                        className={`text-sm ${
                          subtask.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "dark:text-gray-200"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => deleteSubtask(subtask.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Custom Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Campos personalizados
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingCustomField(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {isAddingCustomField && (
              <div className="mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newCustomFieldName}
                    onChange={(e) => setNewCustomFieldName(e.target.value)}
                    placeholder="Nome do campo"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                  <Input
                    value={newCustomFieldValue}
                    onChange={(e) => setNewCustomFieldValue(e.target.value)}
                    placeholder="Valor do campo"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCustomField}>
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingCustomField(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedTask.customFields.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhum campo personalizado ainda.
                </p>
              ) : (
                editedTask.customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                  >
                    <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                      <div className="text-sm font-medium dark:text-gray-200">
                        {field.name}:
                      </div>
                      <Input
                        value={field.value || ""}
                        onChange={(e) =>
                          updateCustomField(field.id!, e.target.value)
                        }
                        className="h-7 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => deleteCustomField(field.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t dark:border-gray-700 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 dark:border-gray-600 dark:text-gray-200"
          onClick={handleDuplicateTask}
        >
          <Copy className="h-4 w-4 mr-2" /> Duplicar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> Deletar tarefa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-gray-200">
                Tem certeza que deseja deletar?
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-400">
                Esta ação não pode ser desfeita. Isso irá deletar
                permanentemente a tarefa e todas as suas subtarefas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTask}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
