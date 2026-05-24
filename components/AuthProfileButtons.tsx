"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import SignInButton from "./SignInButton";
import SignUpButton from "./SignUpButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { UserType } from "@prisma/client";
import { getUserImage } from "@/actions/user-profile";
import Image from "next/image";
import { getOrganizationLogo } from "@/actions/organization-profile";
import Logout from "./Logout";

export function AuthProfileButtons({
  isMobile,
  onMenuAction,
}: {
  isMobile: boolean;
  onMenuAction?: () => void;
}) {
  const { data: session, isPending: isSessionPending } = useSession();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [hasLoadedImage, setHasLoadedImage] = useState(false);

  const fetchUserImage = useCallback(async () => {
    const imagePath = await getUserImage();
    if (imagePath) {
      setImage(imagePath);
    } else {
      setImage(null);
    }
  }, []);

  const fetchOrganizationLogo = useCallback(async () => {
    const logoPath = await getOrganizationLogo();
    if (logoPath) {
      setImage(logoPath);
    } else {
      setImage(null);
    }
  }, []);

  useEffect(() => {
    if (!session?.user || hasLoadedImage) return;

    if (session.user.userType !== UserType.organization) {
      fetchUserImage();
    } else {
      fetchOrganizationLogo();
    }

    setHasLoadedImage(true);
  }, [session?.user.id, hasLoadedImage, fetchUserImage, fetchOrganizationLogo]);

  const handleProfileClick = () => {
    setIsPopoverOpen(false);
  };

  if (isSessionPending) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-neutrals-200 h-10 w-10 animate-pulse rounded-full md:h-12 md:w-12" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <>
        {isMobile ? (
          <div className="flex items-center justify-center">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger
                render={
                  <button
                    className="focus:ring-primary-500 rounded-full focus:ring-2 focus:outline-none"
                    disabled={isSessionPending}
                  >
                    <Avatar className="hover:ring-primary-400 aspect-square size-10 cursor-pointer ring-offset-1 transition-all hover:ring-2">
                      {image && (
                        <Image
                          src={image}
                          alt={session.user.name || "المستخدم"}
                          fill
                          className="rounded-full object-cover"
                        />
                      )}
                      <AvatarFallback className="border-primary-500 text-primary-500 border-2 font-semibold">
                        <Image
                          src="/images/icons/user-reverse.svg"
                          alt="User Icon"
                          width={24}
                          height={24}
                        />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              ></PopoverTrigger>
              <PopoverContent
                className="bg-neutrals-100 border-neutrals-300 w-48 border p-2 shadow-lg"
                align="end"
                dir="rtl"
              >
                <div className="flex flex-col space-y-1">
                  {/* User Info */}
                  <div className="border-neutrals-300 border-b px-3 py-2">
                    <p className="text-neutrals-700 truncate text-sm font-semibold">
                      {session.user.name || "المستخدم"}
                    </p>
                    <p className="text-neutrals-500 truncate text-xs">
                      {session.user.email}
                    </p>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Image
                      src="/images/icons/settings.svg"
                      alt="Settings Icon"
                      width={24}
                      height={24}
                      className="text-neutrals-600 h-4 w-4"
                    />
                    الملف الشخصي
                  </Link>
                  <Link
                    href="/feedback"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Star className="h-4 w-4" />
                    شاركنا رأيك
                  </Link>
                  <Link
                    href="/profile#newsletter"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Image
                      src="/images/icons/messages.svg"
                      alt="Newsletter Icon"
                      width={16}
                      height={16}
                      className="text-neutrals-600 h-4 w-4"
                    />
                    النشرة البريدية
                  </Link>

                  {/* Logout Button */}
                  <Logout
                    onMenuAction={onMenuAction}
                    setIsPopoverOpen={setIsPopoverOpen}
                    isMobile={isMobile}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="flex items-center">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger
                render={
                  <button
                    className="focus:ring-secondary-600 rounded-full focus:ring-2 focus:outline-none"
                    disabled={isSessionPending}
                    aria-label="Open user menu"
                  >
                    <Avatar className="hover:ring-primary-400 h-10 w-10 cursor-pointer ring-offset-1 transition-all hover:ring-2 md:h-12 md:w-12">
                      <AvatarImage
                        className="object-cover"
                        src={image || ""}
                        alt={session.user.name || "المستخدم"}
                      />
                      <AvatarFallback className="border-primary-500 text-primary-500 border-2 font-semibold">
                        <Image
                          src="/images/icons/user-reverse.svg"
                          alt="User Icon"
                          width={24}
                          height={24}
                        />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              ></PopoverTrigger>
              <PopoverContent
                className="bg-neutrals-100 border-neutrals-300 w-56 border p-2 shadow-lg"
                align="end"
                dir="rtl"
              >
                <div className="flex flex-col space-y-1">
                  {/* User Info */}
                  <div className="border-neutrals-300 border-b px-3 py-3">
                    <p className="text-neutrals-700 truncate text-sm font-semibold">
                      {session.user.name || "المستخدم"}
                    </p>
                    <p className="text-neutrals-500 truncate text-xs">
                      {session.user.email}
                    </p>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Image
                      src="/images/icons/settings.svg"
                      alt="Settings Icon"
                      width={24}
                      height={24}
                      className="text-neutrals-600 h-4 w-4"
                    />
                    الملف الشخصي
                  </Link>
                  <Link
                    href="/feedback"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Star className="h-4 w-4" />
                    شاركنا رأيك
                  </Link>
                  <Link
                    href="/profile#newsletter"
                    className="text-neutrals-600 hover:bg-neutrals-200 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    onClick={handleProfileClick}
                  >
                    <Image
                      src="/images/icons/messages.svg"
                      alt="Newsletter Icon"
                      width={16}
                      height={16}
                      className="text-neutrals-600 h-4 w-4"
                    />
                    النشرة البريدية
                  </Link>

                  {/* Logout Button */}
                  <Logout
                    onMenuAction={onMenuAction}
                    setIsPopoverOpen={setIsPopoverOpen}
                    isMobile={isMobile}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isMobile ? (
        <div className="flex flex-1/3 flex-col gap-3">
          <SignUpButton onMenuAction={onMenuAction} />
          <SignInButton onMenuAction={onMenuAction} />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <SignUpButton onMenuAction={onMenuAction} />
          <SignInButton onMenuAction={onMenuAction} />
        </div>
      )}
    </>
  );
}
