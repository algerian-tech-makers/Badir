"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

type Attachment = { id: string; imageUrl: string };

export function ImageStrip({ attachments }: { attachments: Attachment[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {attachments.map((atch) => (
          <img
            key={atch.id}
            src={atch.imageUrl}
            alt=""
            className="h-48 w-auto shrink-0 cursor-pointer rounded-md object-cover transition-opacity hover:opacity-90"
            onClick={() => setSelected(atch.imageUrl)}
          />
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)} modal>
        <DialogContent className="flex max-h-screen max-w-6xl items-center justify-center rounded-none p-1 [&>button:last-child]:hidden">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 rounded-full bg-black/20 p-1 text-white hover:bg-black/50"
          >
            <X className="h-5 w-5" />
          </button>
          {selected && (
            <img
              src={selected}
              alt=""
              className="max-h-[95vh] max-w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
