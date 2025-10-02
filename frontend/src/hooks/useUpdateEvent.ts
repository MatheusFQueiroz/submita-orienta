import { useState } from "react";
import { eventService } from "@/lib/service/eventService";
import { EventFormData } from "@/lib/validations";
import { Event } from "@/types";
import toast from "react-hot-toast";

interface UseUpdateEventReturn {
  updateEvent: (
    eventId: string,
    formData: EventFormData & { imageId?: string }
  ) => Promise<Event>;
  isUpdating: boolean;
}

export function useUpdateEvent(): UseUpdateEventReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateEvent = async (
    eventId: string,
    formData: EventFormData & { imageId?: string }
  ): Promise<Event> => {
    try {
      setIsUpdating(true);

      console.log("formData recebido no hook:", formData);
      console.log("imageId:", formData.imageId);

      // ✅ Preparar dados para atualização
      const updateData = {
        name: formData.name,
        description: formData.description,
        eventStartDate: formData.eventStartDate,
        eventEndDate: formData.eventEndDate,
        submissionStartDate: formData.submissionStartDate,
        submissionEndDate: formData.submissionEndDate,
        evaluationType: formData.evaluationType,
        ...(formData.imageId && { banner: formData.imageId }),
      };

      console.log("updateData enviado para API:", updateData);

      const updatedEvent = await eventService.updateEvent(eventId, updateData);

      toast.success("Evento atualizado com sucesso!");
      return updatedEvent;
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar evento");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateEvent,
    isUpdating,
  };
}
