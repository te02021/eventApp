"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type UpdateUser = Partial<InferInsertModel<typeof users>>;

export async function updateUser(formData: FormData) {
  console.log("🚀 [Server Action] Inicio actualización de perfil");
  const session = await auth();
  if (!session?.user?.id) {
    console.error("❌ [Error] No hay sesión o ID de usuario");
    return { success: false, error: "No autorizado" };
  }
  console.log(
    `👤 [Usuario] ID: ${session.user.id} | Email: ${session.user.email}`,
  );
  const rawFirstName = formData.get("firstName");
  const rawLastName = formData.get("lastName");
  const rawAge = formData.get("age");
  const rawImage = formData.get("image");

  console.log("📦 [Payload Recibido]:", {
    firstName: rawFirstName,
    lastName: rawLastName,
    age: rawAge,
    hasImage: rawImage ? "Sí" : "No",
    imageType: rawImage instanceof File ? "File" : typeof rawImage,
  });
  const imageFile = formData.get("image") as File;
  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    console.log("📸 [Cloudinary] Subiendo imagen nueva...");
    try {
      imageUrl = await uploadImageToCloudinary(imageFile);
      console.log("✅ [Cloudinary] URL generada:", imageUrl);
    } catch (uploadError) {
      console.error("❌ [Cloudinary Error]", uploadError);
      return { success: false, error: "Error subiendo la imagen" };
    }
  } else {
    console.log("ℹ️ [Imagen] No se detectó imagen nueva para subir.");
  }
  const userToUpdate: UpdateUser = {
    firstName: rawFirstName as string,
    lastName: rawLastName as string,
    age: Number(rawAge),
    name: `${rawFirstName} ${rawLastName}`,
  };
  if (imageUrl) {
    userToUpdate.image = imageUrl;
  }
  console.log("💾 [DB] Intentando actualizar con:", userToUpdate);
  try {
    const result = await db
      .update(users)
      .set(userToUpdate)
      .where(eq(users.email, session.user.email as string));
    console.log("✨ [DB] Resultado:", result);
    revalidatePath("/profile");
    return { success: true, userImageUrl: imageUrl };
  } catch (error) {
    console.log(error);
    return { success: false, error: `Ocurrio el siguiente error: ${error}` };
  }
}
