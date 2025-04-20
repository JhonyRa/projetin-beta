import { Request, Response } from "express";
import { folderService, FolderService } from "../services/folder.service";
import {
  createFolderSchema,
  updateFolderSchema,
} from "../schemas/folder.schema";
import { clerkClient, getAuth } from "@clerk/express";
import { userService } from "../services/user.service";
import { AppError } from "../errors/app-error";
import { ZodError } from "zod";
import { folderPermissionRepository } from "../repositories/folder-permission.repository";
import { folderPermissionService } from "../services/folder-permission.service";
import { UserRole } from "../@types/enums";

export class FolderController {
  async create(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth || !auth.userId)
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const user = await userService.findByClerkId(auth.userId);
      if (!clerkUser || !user)
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      await clerkClient.users.updateUser(user.clerkId, {
        externalId: user.id,
      });
      const validatedData = createFolderSchema.parse(req.body);
      const folder = await folderService.create(validatedData, user.id);
      return res.status(201).json(folder);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res
        .status(500)
        .json({ error: "Erro ao processar upload do vídeo" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const auth = getAuth(req);
      let userId: string | undefined;
      
      if (auth?.userId) {
        const user = await userService.findByClerkId(auth.userId);
        if (user) {
          userId = user.id;
        }
      }

      const folder = await folderService.findById(folderId, userId);
      return res.json(folder);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res
        .status(500)
        .json({ error: "Erro ao buscar pasta e seus conteúdos" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth || !auth.userId)
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const user = await userService.findByClerkId(auth.userId);
      if (!clerkUser || !user)
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      await clerkClient.users.updateUser(user.clerkId, {
        externalId: user.id,
      });
      const { folderId } = req.params;
      const data = updateFolderSchema.parse(req.body);
      const folder = await folderService.update(folderId, data, user.id);
      return res.json(folder);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao atualizar pasta" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const auth = getAuth(req);
      if (!auth || !auth.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }
      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }
      // Deletar pasta e todo seu conteúdo recursivamente
      await folderService.deleteRecursively(folderId);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res
        .status(500)
        .json({ error: "Erro ao deletar pasta e seu conteúdo" });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const folders = await folderService.findAll();
      return res.json(folders);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao buscar pastas" });
    }
  }

  async findEditors(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const editors = await folderPermissionRepository.findEditorsByFolderId(folderId);
      return res.json(editors);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao buscar editores da pasta" });
    }
  }

  async checkPermission(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const auth = getAuth(req);
      if (!auth || !auth.userId) {
        return res.status(401).json({ error: "Unauthorized: No signed-in user" });
      }

      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Se é admin ou global editor, tem permissão automática
      if (user.role === UserRole.ADMIN || user.role === UserRole.GLOBAL_EDITOR) {
        return res.json({ hasPermission: true });
      }

      // Verifica permissão na pasta
      const hasPermission = await folderPermissionService.userHasPermission(user.id, folderId);
      return res.json({ hasPermission });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao verificar permissão na pasta" });
    }
  }
}