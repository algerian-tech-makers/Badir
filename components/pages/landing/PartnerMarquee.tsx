"use client";
import { Partner } from "@/types/Statics";
import { Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PartnerMarquee = ({ partners }: { partners: Partner[] }) => {
  return (
    <div
      className="wrapper flex-center bg-primary-400 max-w-full"
      style={{ "--number-marquee": partners.length } as React.CSSProperties}
    >
      {partners.map((partner, index) => (
        <div
          className="item itemRight flex-center-column h-full items-center gap-2 py-1"
          style={{ "--position": index } as React.CSSProperties}
          key={`marquee-card-${index}`}
        >
          <div className="bg-neutrals-100 h-20 min-h-20 w-20 min-w-20 flex-shrink-0 overflow-hidden rounded-full border">
            {partner.url ? (
              <Link href={partner.url}>
                {partner.imageSrc ? (
                  <Image
                    alt={partner.name}
                    src={partner.imageSrc}
                    className="overflow-hidden rounded-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building className="text-neutrals-500 h-8 w-8" />
                  </div>
                )}
              </Link>
            ) : (
              <>
                {" "}
                {partner.imageSrc ? (
                  <Image
                    alt={partner.name}
                    src={partner.imageSrc}
                    className="overflow-hidden rounded-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building className="text-neutrals-500 h-8 w-8" />
                  </div>
                )}
              </>
            )}
          </div>
          <span className="text-neutrals-100 mt-2 block w-20 truncate text-center text-sm font-medium">
            {partner.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PartnerMarquee;
