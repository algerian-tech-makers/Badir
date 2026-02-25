"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
// import DOMPurify from "isomorphic-dompurify";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Send } from "lucide-react";
import RichTextEditor, { BaseKit, useEditorState } from "reactjs-tiptap-editor";
import { Heading } from "reactjs-tiptap-editor/heading";
import { Bold } from "reactjs-tiptap-editor/bold";
import { Italic } from "reactjs-tiptap-editor/italic";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { Image } from "reactjs-tiptap-editor/image";
import { Link } from "reactjs-tiptap-editor/link";
import { Color } from "reactjs-tiptap-editor/color";
import { BubbleMenuDrawer } from "reactjs-tiptap-editor/bubble-extra";
import { SlashCommand } from "reactjs-tiptap-editor/slashcommand";
import { ColumnActionButton } from "reactjs-tiptap-editor/multicolumn";
import {
  createPostAction,
  updatePostAction,
  uploadPostImageAction,
} from "@/actions/posts";
import { PostType, PostStatus } from "@prisma/client";
import { toast } from "sonner";
import FormInput from "./form-input";
import { BUCKET_MIME_TYPES, BUCKET_SIZE_LIMITS } from "@/types/Statics";
import AppButton from "./AppButton";
import { extractImageSrcsFromHtmlBrowser } from "@/lib/utils";
import { sanitize } from "@/lib/santitize-client";

type PostData = {
  id?: string;
  title: string;
  content: string;
  postType: PostType;
  status: PostStatus;
};

interface PostEditorProps {
  initiativeId: string;
  initialData?: PostData;
  onSave?: (post: PostData) => void;
  onCancel?: () => void;
}

export default function PostEditor({
  initiativeId,
  initialData,
  onSave,
  onCancel,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [postType, setPostType] = useState<PostType>(
    initialData?.postType || "announcement",
  );
  const [isPending, startTransition] = useTransition();
  const staleImageSrcs = useMemo(
    () => extractImageSrcsFromHtmlBrowser(initialData?.content || ""),
    [initialData?.content],
  );
  const { editorRef } = useEditorState();

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const result = await uploadPostImageAction(
          initiativeId,
          base64.split(",")[1],
          file.name,
          file.type,
        );

        if (result.success && result.url) {
          return result.url;
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      }
    },
    [initiativeId],
  );

  const extensions = useMemo(
    () => [
      BaseKit.configure({
        placeholder: {
          showOnlyCurrent: true,
          placeholder:
            "أدخل محتوى المنشور... (يمكنك استخدام / للوصول إلى الأوامر)",
        },
        characterCount: { limit: 2000 },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        toolbar: true,
      }),
      Bold.configure({ toolbar: true }),
      Italic.configure({ toolbar: true }),
      BulletList.configure({ toolbar: true }),
      OrderedList.configure({ toolbar: true }),
      Link.configure({ toolbar: true, openOnClick: false }),
      Color.configure({ toolbar: true }),
      Image.configure({
        toolbar: true,
        upload: handleImageUpload,
        enableAlt: true,
        resourceImage: "upload",
        acceptMimes: BUCKET_MIME_TYPES["post-images"],
        defaultInline: false,
        maxSize: BUCKET_SIZE_LIMITS["post-images"],
        onError: ({ type, message }) => {
          if (type === "upload") {
            toast.error("فشل تحميل الصورة. ", { description: message });
            return;
          }
          toast.error("حدث خطأ في رفع الصورة. ");
        },
      }),
      SlashCommand,
      ColumnActionButton,
    ],
    [handleImageUpload],
  );

  const handleSave = async (publishStatus: PostStatus) => {
    if (!title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }

    try {
      const sanitizedContent = sanitize(content || "");

      const newImageUrls = extractImageSrcsFromHtmlBrowser(sanitizedContent);
      const removedImageUrls = staleImageSrcs.filter(
        (u) => !newImageUrls.includes(u),
      );

      const postData: PostData = {
        title: title.trim(),
        content: sanitizedContent,
        postType,
        status: publishStatus,
      };

      startTransition(async () => {
        let result;
        if (initialData?.id) {
          result = await updatePostAction(
            initialData.id,
            initiativeId,
            sanitizedContent,
            title.trim(),
            postType,
            publishStatus,
            removedImageUrls,
          );
        } else {
          result = await createPostAction(
            initiativeId,
            sanitizedContent,
            title.trim(),
            postType,
            publishStatus,
          );
        }

        if (result.success) {
          onSave?.(postData);
        } else {
          toast.error(result.error || "حدث خطأ");
        }
      });
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDraft = () => handleSave("draft");
  const handlePublish = () => handleSave("published");

  const postTypeLabels: Record<PostType, string> = useMemo(
    () => ({
      announcement: "إعلان",
      update: "تحديث",
      instruction: "تعليمات",
    }),
    [],
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle dir="rtl">
          {initialData?.id ? "تعديل المنشور" : "منشور جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6" dir="rtl">
        {/* Title Input */}
        <div className="flex-center-column gap-4 md:flex-row md:items-end">
          <FormInput
            type="text"
            label="العنوان"
            name="title"
            placeholder="أدخل عنوان المنشور..."
            value={title}
            onChange={(value) => setTitle(value as string)}
            className="flex-1 text-right"
            rtl={true}
          />
          {/* Post Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="postType">نوع المنشور</Label>
            <Select
              value={postType}
              onValueChange={(value: PostType) => setPostType(value)}
            >
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="اختر نوع المنشور" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(postTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Editor with toolbar & bubble menu */}
        <div className="space-y-2">
          <Label>المحتوى</Label>

          <div className="min-h-[300px] p-3">
            <RichTextEditor
              output="html"
              content={content}
              useEditorOptions={{ autofocus: "start" }}
              onChangeContent={setContent}
              extensions={extensions}
              ref={editorRef}
              dark={false}
              bubbleMenu={{
                render(
                  { extensionsNames, editor, disabled },
                  bubbleDefaultDom,
                ) {
                  return (
                    <>
                      {bubbleDefaultDom}
                      {extensionsNames.includes("drawer") ? (
                        <BubbleMenuDrawer
                          disabled={disabled}
                          editor={editor}
                          key="drawer"
                        />
                      ) : null}
                    </>
                  );
                },
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-1 pt-4" dir="ltr">
          <div className="flex gap-2">
            <AppButton
              type="outline"
              onClick={onCancel}
              disabled={isPending}
              border="default"
              size="sm"
            >
              إلغاء
            </AppButton>
          </div>

          <div className="flex gap-2">
            <AppButton
              type="outline"
              onClick={handleDraft}
              disabled={isPending}
              icon={
                isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )
              }
              border="default"
              size="sm"
            >
              حفظ كمسودة
            </AppButton>

            <AppButton
              type="primary"
              onClick={handlePublish}
              disabled={isPending}
              border="default"
              size="sm"
              icon={
                isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )
              }
            >
              نشر
            </AppButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
