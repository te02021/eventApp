"use client";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { logout } from "@/actions/auth-actions";

export default function LogoutButton() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive bg-transparent"
        onClick={() => setShowLogoutConfirm(true)}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">¿Cerrar sesión?</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground text-sm">
            Tendrás que volver a iniciar sesión para acceder a tus eventos y
            rutinas.
          </p>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cerrar Sesión"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
