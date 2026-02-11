import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Definimos un "endpoint" llamado imageUploader
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async () => {
      // Solo usuarios logueados pueden subir fotos
      const session = await auth();
      if (!session?.user) throw new Error("No autorizado");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Esto se ejecuta en el servidor cuando termina la subida
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
