"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { CloudUpload, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useRouter, useSearchParams } from "next/navigation";

export function PrescriptionUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addPrescription = useCartStore((s) => s.addPrescription);
  const { toast } = useToast();
  const router = useRouter();
  const search = useSearchParams();

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "حجم زیاد است", description: "حداکثر ۱۰ مگابایت مجاز است." });
        return;
      }
      setUploading(true);
      setProgress(10);
      const { uploadUrl, previewUrl } = await api.requestUploadSignedUrl(file.name);
      // Mock upload progress
      setProgress(40);
      await new Promise((r) => setTimeout(r, 250));
      setProgress(75);
      await fetch(uploadUrl, { method: "PUT", body: file }).catch(() => {});
      setProgress(100);
      setPreview(previewUrl);
      const record = addPrescription({
        ownerId: "user-1",
        doctorName: "آپلود شده",
        fileType: file.type.includes("pdf") ? "pdf" : "image",
        previewUrlMock: previewUrl,
      });
      toast({ title: "آپلود انجام شد", description: "نسخه به گنجه اضافه شد." });
      setUploading(false);
      if (search?.get("from") === "checkout") {
        router.push(`/checkout?selectedPrescriptionId=${record.id}`);
      }
    },
    [addPrescription, router, search, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [], "application/pdf": [] },
  });

  return (
    <Card className="overflow-hidden border-dashed border-brand/40 bg-brand/5">
      <CardHeader>
        <CardTitle>آپلود نسخه</CardTitle>
        <CardDescription>تصویر یا PDF را بکشید و رها کنید. لینک امن برای پیش‌نمایش ایجاد می‌شود.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand/50 bg-white/50 text-center transition hover:border-brand hover:bg-brand/5"
        >
          <input {...getInputProps()} />
          <CloudUpload className="mb-3 h-8 w-8 text-brand" />
          <p className="text-sm text-text/80">
            {isDragActive ? "اینجا رها کنید" : "فایل نسخه را رها کنید یا کلیک کنید"}
          </p>
          <p className="text-xs text-muted">PDF یا تصویر تا ۱۰ مگابایت</p>
        </div>
        {uploading && (
          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-12 w-12">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-brand/20"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-1 rounded-full border-4 border-t-brand"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              />
              <div className="absolute inset-2 grid place-items-center rounded-full bg-white">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">در حال آپلود...</p>
              <p className="text-xs text-muted">{progress}%</p>
            </div>
          </div>
        )}
        {preview && (
          <div className="mt-4 space-y-2">
            <img src={preview} alt="Preview" className="h-36 w-full rounded-xl object-cover" />
            <div className="flex items-center gap-2 text-sm text-muted">
              <Shield className="h-4 w-4 text-brand" />
              لینک پیش‌نمایش امن ساخته شد
            </div>
            <Button asChild>
              <a href="/prescriptions">نمایش در گنجه</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
