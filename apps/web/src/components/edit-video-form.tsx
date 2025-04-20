"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

import { baseApi } from "@/configs/axios";

// Schema de validação
const editVideoSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  displayOrder: z.union([z.number(), z.string()]).transform(val => 
    val === '' ? null : typeof val === 'string' ? Number(val) : val
  ).nullable().optional(),
});

type EditVideoFormData = z.infer<typeof editVideoSchema>;

interface EditVideoFormProps {
  videoId: string;
  initialData: {
    title: string;
    description?: string;
    displayOrder?: number;
  };
  onSuccess?: () => void;
}

export function EditVideoForm({ videoId, initialData, onSuccess }: EditVideoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditVideoFormData>({
    resolver: zodResolver(editVideoSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description || "",
      displayOrder: initialData.displayOrder ?? null,
    },
  });

  const onSubmit = async (data: EditVideoFormData) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      if (!token) {
        throw new Error("Não autorizado");
      }
      
      console.log("Submitting data:", data);
      
      // Ensure displayOrder is properly formatted
      const submissionData = {
        ...data,
        displayOrder: data.displayOrder === null ? null : Number(data.displayOrder)
      };
      
      await baseApi.patch(`/videos/${videoId}`, submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Vídeo atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      router.back();
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar vídeo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o vídeo. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Editar Vídeo</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ordem de exibição (opcional)"
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Determina a ordem de exibição dos vídeos na pasta. Números menores aparecem primeiro.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
