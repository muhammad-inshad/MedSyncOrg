import toast from "react-hot-toast";


export const showToast = {
    success: (message: string, id: string = "default-success") => {
        toast.dismiss(id);
        return toast.success(message, { id });
    },
    error: (message: string, id: string = "default-error") => {
        toast.dismiss(id);
        return toast.error(message, { id });
    },
    loading: (message: string, id: string = "default-loading") => {
        toast.dismiss(id);
        return toast.loading(message, { id });
    },
    dismiss: (id?: string) => {
        toast.dismiss(id);
    }
};
