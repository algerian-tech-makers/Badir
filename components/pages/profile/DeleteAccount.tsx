"use client";
import { deleteUserAccountAction } from "@/actions/user-profile";
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
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export default function DeleteAccount() {
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await deleteUserAccountAction();
        if (response.success) {
          toast.success("تم حذف حسابك بنجاح");
        } else {
          toast.error("حدث خطأ أثناء حذف حسابك. يرجى المحاولة مرة أخرى.");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("حدث خطأ أثناء حذف حسابك. يرجى المحاولة مرة أخرى.");
      }
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full rounded-md bg-red-100 px-4 py-2 text-red-500 hover:text-red-700">
        حذف الحساب
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            هل أنت متأكد أنك تريد حذف حسابك؟
          </AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف جميع بياناتك ولن تتمكن من استعادتها. يرجى التأكد من أنك
            تريد المتابعة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              "حذف الحساب"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
