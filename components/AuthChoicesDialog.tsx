import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Link from "next/link";
import { ArrowUpLeft, Building, User } from "lucide-react";
import { authRoutes } from "@/data/routes";

export default function AuthChoicesDialog({ close }: { close: () => void }) {
  return (
    <DialogContent
      dir="rtl"
      className="bg-neutrals-100 min-w-2/3 space-y-6 px-6 py-10 md:px-12"
    >
      <DialogHeader className="w-full">
        <DialogTitle className="text-primary-sm md:text-primary-lg text-neutrals-700 block w-full text-center font-bold">
          سجل كـــ
        </DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>

      <div
        className="mt-4 grid w-full grid-cols-1 items-center justify-items-center gap-10 md:grid-cols-2 md:gap-14"
        dir="ltr"
      >
        <Link
          href={authRoutes.signup.signupIndividual.url}
          className="flex-center-column size-max items-center"
          dir="rtl"
          onClick={close}
        >
          <div className="bg-primary-500 rounded-full p-3 md:p-4">
            <User
              className="text-neutrals-100 h-12 w-12 md:h-16 md:w-16"
              strokeWidth={1}
            />
          </div>
          <div className="flex-center items-end gap-2">
            <span className="text-secondary-sm md:text-secondary-lg text-neutrals-700 font-bold underline">
              {authRoutes.signup.signupIndividual.label}
            </span>
            <ArrowUpLeft className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </Link>
        <Link
          href={authRoutes.signup.signupOrganization.url}
          className="flex-center-column size-max items-center"
          dir="rtl"
          onClick={close}
        >
          <div className="bg-primary-500 rounded-full p-3 md:p-4">
            <Building
              className="text-neutrals-100 h-12 w-12 md:h-16 md:w-16"
              strokeWidth={1}
            />
          </div>
          <div className="flex-center items-end gap-2">
            <span className="text-secondary-sm md:text-secondary-lg text-neutrals-700 font-bold underline">
              {authRoutes.signup.signupOrganization.label}
            </span>
            <ArrowUpLeft className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </Link>
      </div>
    </DialogContent>
  );
}
