"use client";

import { useState } from "react";
import {
  UserPlus,
  Send,
  Mail,
  Search,
  MoreVertical,
  Shield,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "next-auth";

interface CollaboratorFromDB {
  role: "admin" | "editor" | "viewer";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface TeamTabProps {
  collaborators: CollaboratorFromDB[];
  currentUser: User;
}

const roleConfig: Record<string, { bg: string; text: string; label: string }> =
  {
    admin: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-300",
      label: "Admin",
    },
    editor: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      label: "Editor",
    },
    viewer: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      label: "Lector",
    },
  };

export function TeamTab({ collaborators, currentUser }: TeamTabProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const members = collaborators.map((c) => ({
    id: c.user.id,
    name: c.user.name || "Usuario",
    email: c.user.email,
    avatar: c.user.image || "",
    role: c.role,
    isCurrentUser: c.user.id === currentUser.id,
  }));

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      // AQUÍ IRÁ LA SERVER ACTION EN EL FUTURO
      console.log("Invitando a:", inviteEmail);
      setInviteEmail("");
      setShowInvite(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          Participantes
          <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
            {members.length}
          </Badge>
        </h3>
        <Button
          variant={showInvite ? "secondary" : "outline"}
          size="sm"
          className="h-9 gap-2 rounded-lg transition-all"
          onClick={() => setShowInvite(!showInvite)}
        >
          <UserPlus className="h-4 w-4" />
          {showInvite ? "Cerrar" : "Invitar"}
        </Button>
      </div>

      {/* Invite Input */}
      {showInvite && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10 h-11 bg-background"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                autoFocus
              />
            </div>
            <Button
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Se enviará un enlace de acceso directo a este correo.
          </p>
        </Card>
      )}

      {members.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en el equipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/30 border-0"
          />
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No se encontraron miembros.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <Card
              key={member.id}
              className={`p-3 transition-colors ${member.isCurrentUser ? "border-primary/30 bg-primary/5" : "hover:bg-muted/30"}`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate flex items-center gap-2">
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="text-[10px] text-muted-foreground font-normal bg-background px-1.5 py-0.5 rounded-sm border">
                        Tú
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </p>
                </div>

                {/* Role Badge */}
                <Badge
                  variant="secondary"
                  className={`${roleConfig[member.role]?.bg || "bg-gray-100"} ${roleConfig[member.role]?.text || "text-gray-700"} border-0 text-[10px] px-2 h-5 font-medium shrink-0`}
                >
                  {roleConfig[member.role]?.label || member.role}
                </Badge>

                {/* Actions Menu (Solo mostramos opciones para otros usuarios) */}
                {!member.isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground ml-1"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Gestionar acceso</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Cambiar Rol
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar del equipo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
