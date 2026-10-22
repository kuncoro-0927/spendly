import { toast } from "@/components/ui/toast";

export const showError = (description: string) => {
  toast.add({
    title: "Error",
    description,
    type: "error",
  });
};

export const showSuccess = (description: string) => {
  toast.add({
    title: "Berhasil",
    description,
    type: "success",
  });
};

export const showInfo = (description: string) => {
  toast.add({
    title: "Informasi",
    description,
    type: "info",
  });
};
