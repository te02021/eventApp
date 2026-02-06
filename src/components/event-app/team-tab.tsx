"use client";

import { useState } from "react";
import { UserPlus, Send, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "editor" | "viewer";
}

const collaborators: Collaborator[] = [
  {
    id: "1",
    name: "Juan Díaz",
    email: "juan@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=juan",
    role: "admin",
  },
  {
    id: "2",
    name: "María García",
    email: "maria@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    role: "editor",
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    role: "editor",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    role: "viewer",
  },
  {
    id: "5",
    name: "Pedro Ruiz",
    email: "pedro@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
    role: "viewer",
  },
];

const roleConfig: Record<string, { bg: string; text: string; label: string }> =
  {
    admin: { bg: "bg-purple-100", text: "text-purple-700", label: "Admin" },
    editor: { bg: "bg-blue-100", text: "text-blue-700", label: "Editor" },
    viewer: { bg: "bg-gray-100", text: "text-gray-700", label: "Lector" },
  };

export function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      // AQUÍ CONECTAREMOS LA LÓGICA DE INVITACIÓN (Server Action)
      console.log("Invitando a:", inviteEmail);
      // Handle invite logic
      setInviteEmail("");
      setShowInvite(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Participantes ({collaborators.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-2 rounded-xl bg-transparent"
          onClick={() => setShowInvite(!showInvite)}
        >
          <UserPlus className="h-4 w-4" />
          Invitar
        </Button>
      </div>

      {/* Invite Input */}
      {showInvite && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <Button
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0"
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            El colaborador recibirá un enlace de invitación por correo.
          </p>
        </Card>
      )}

      {/* Collaborators List */}
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <Card
            key={collaborator.id}
            className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={collaborator.avatar || "/placeholder.svg"}
                  alt={collaborator.name}
                />
                <AvatarFallback>
                  {collaborator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {collaborator.name}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {collaborator.email}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`${roleConfig[collaborator.role].bg} ${roleConfig[collaborator.role].text} text-xs font-medium`}
              >
                {roleConfig[collaborator.role].label}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
