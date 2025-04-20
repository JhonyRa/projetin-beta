import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { userService } from "../services/user.service";
import { folderPermissionService } from "../services/folder-permission.service";
import { UserRole } from "../@types/enums";

export const checkRole = (
  allowedRoles?: string[],
  getFolderId?: (req: Request) => string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ error: "Unauthorized: No signed-in user" });
    }

    const user = await userService.findByClerkId(auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Se tiver roles permitidas, APENAS verifica se o usuário tem uma delas
    if (allowedRoles && allowedRoles.length > 0) {
      if (allowedRoles.includes(user.role)) {
        return next();
      }
      return res.status(403).json({
        error: "Acesso permitido apenas para roles específicas",
        statusCode: 403,
      });
    }

    // Se não tiver roles específicas, verifica permissões gerais
    const isAdmin = user.role === UserRole.ADMIN;
    const isGlobalEditor = user.role === UserRole.GLOBAL_EDITOR;
    if (isAdmin || isGlobalEditor) {
      return next();
    }

    // Verifica permissão na pasta
    if (getFolderId) {
      const folderId = getFolderId(req);
      const hasEditorPermission =
        await folderPermissionService.userHasPermission(user.id, folderId);
      if (hasEditorPermission) {
        return next();
      }
    }

    return res.status(403).json({
      error: "Acesso não autorizado",
      statusCode: 403,
    });
  };
};
