"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import {
  Camera,
  Edit3,
  User,
  Mail,
  Calendar,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { Session } from "next-auth";
import { updateUser } from "@/actions/profile-actions";
import { useSession } from "next-auth/react";

interface ProfileViewProps {
  user: Session["user"];
}

type User = Session["user"] & {
  firstName?: string;
  lastName?: string;
  age?: number;
};

export function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState(user.firstName || "");
  const [editLastName, setEditLastName] = useState(user.lastName || "");
  const [editAge, setEditAge] = useState(user.age?.toString() || "");
  const [editAvatar, setEditAvatar] = useState(user.image || "");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const { update } = useSession();

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("firstName", editFirstName || user.firstName || "");
    formData.append("lastName", editLastName || user.lastName || "");
    formData.append("age", String(editAge || user.age || ""));
    if (fileToUpload) {
      formData.append("image", fileToUpload);
    }
    const result = await updateUser(formData);

    if (result.success) {
      const serverImageUrl = result.userImageUrl || user.image;

      await update({
        user: {
          firstName: editFirstName,
          lastName: editLastName,
          age: Number(editAge),
          image: serverImageUrl,
        },
      });

      if (serverImageUrl) {
        setEditAvatar(serverImageUrl);
      }
      setIsEditing(false);
    } else {
      console.error(result.error);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditAge(user.age?.toString() || "");
    setEditAvatar(user.image || "");
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-linear-to-b from-primary/10 to-background px-4 pt-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">Mi Perfil</h1>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage
                src={
                  editAvatar ||
                  (fileToUpload
                    ? URL.createObjectURL(fileToUpload)
                    : `https://ui-avatars.com/api/?name=${editFirstName}+${editLastName}`)
                }
                alt={`${editFirstName}+${editLastName}`}
              />
            </Avatar>
            {isEditing && (
              <>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    setFileToUpload(e.target.files?.[0] || null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef?.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    setFileToUpload(e.target.files?.[0] || null);
                  }}
                />
              </>
            )}
          </div>
          {!isEditing && (
            <>
              <h2 className="text-xl font-semibold mt-4 text-foreground">
                {editFirstName} {editLastName}
              </h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 -mt-6">
        {isEditing ? (
          /* Edit Form */
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName" className="text-sm">
                    Nombre
                  </Label>
                  <Input
                    id="edit-firstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName" className="text-sm">
                    Apellido
                  </Label>
                  <Input
                    id="edit-lastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age" className="text-sm">
                  Edad
                </Label>
                <Input
                  id="edit-age"
                  type="number"
                  min="13"
                  max="120"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Correo electrónico
                </Label>
                <div className="h-11 px-3 flex items-center bg-muted/50 rounded-md text-muted-foreground">
                  {user.email}
                </div>
                <p className="text-xs text-muted-foreground">
                  El correo no se puede modificar
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Profile Info View */
          <>
            <Card className="border shadow-sm mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-3 py-3 border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Nombre completo
                    </p>
                    <p className="font-medium text-foreground">
                      {editFirstName} {editLastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Correo electrónico
                    </p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Edad</p>
                    <p className="font-medium text-foreground">
                      {editAge} años
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Section */}
            {/* <Card className="border shadow-sm mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">
                      Notificaciones
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gestiona tus alertas
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Privacidad</p>
                    <p className="text-xs text-muted-foreground">
                      Controla tu información
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Ayuda</p>
                    <p className="text-xs text-muted-foreground">
                      Soporte y preguntas frecuentes
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card> */}

            {/* Logout Button */}
            <LogoutButton />

            {/* App Version */}
            <p className="text-center text-xs text-muted-foreground mt-6 pb-4">
              EventApp v1.0.0
            </p>
          </>
        )}
      </div>
    </div>
  );
}
