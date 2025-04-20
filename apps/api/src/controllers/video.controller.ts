import { Request, Response } from "express";
import { videoService } from "../services/video.service";
import { uploadVideoSchema, updateVideoSchema } from "../schemas/video.schema";
import { getAuth } from "@clerk/express";
import { userService } from "../services/user.service";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { UserRole } from "../@types/enums";

export class VideoController {
  async uploadVideo(req: Request, res: Response) {
    try {
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

      // Verificar arquivo
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }
      
      // Remover displayOrder do body se estiver causando problemas
      const { displayOrder, ...restBody } = req.body;
      
      // Validar tanto o arquivo quanto os dados do formulário
      const validatedData = uploadVideoSchema.parse({
        body: restBody,
        file: req.file,
      });

      const video = await videoService.uploadVideo(
        req.file!,
        validatedData.body,
        user.id
      );

      return res.status(201).json(video);
    } catch (error) {
      console.error("Erro ao fazer upload do vídeo:", error);

      if (error instanceof ZodError) {
        // Formata os erros de validação de forma mais amigável
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


  async delete(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }

      // Verificar se o usuário existe no banco
      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.GLOBAL_EDITOR
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized: User not authorized" });
      }

      const { id } = req.params;
      await videoService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar vídeo:", error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao deletar vídeo" });
    }
  }

  async getVideoUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = getAuth(req);
      let userId;

      if (auth?.userId) {
        const user = await userService.findByClerkId(auth.userId);
        userId = user?.id;
      }

      const video = await videoService.findById(id, userId);
      return res.json(video);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async updateVideo(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }

      // Verificar se o usuário existe no banco
      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Verificar se o usuário tem permissão para editar vídeos
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.GLOBAL_EDITOR
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized: User not authorized" });
      }

      const { id } = req.params;
      
      // Validar os dados de atualização
      const validatedData = updateVideoSchema.parse(req.body);
      
      // Atualizar o vídeo
      const updatedVideo = await videoService.update(id, validatedData);
      
      return res.json(updatedVideo);
    } catch (error) {
      console.error("Erro ao atualizar vídeo:", error);

      if (error instanceof ZodError) {
        // Formata os erros de validação de forma mais amigável
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({ errors });
      }

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao atualizar vídeo" });
    }
  }

  async markAsViewed(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }

      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { id } = req.params;
      const { watchDurationSeconds, completed } = req.body;

      const videoView = await videoService.markAsViewed(id, user.id, {
        watchDurationSeconds,
        completed
      });

      return res.json(videoView);
    } catch (error) {
      console.error("Erro ao marcar vídeo como visto:", error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao marcar vídeo como visto" });
    }
  }

  async getVideoView(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }

      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { id } = req.params;
      const videoView = await videoService.getVideoViews(id, user.id);

      return res.json(videoView);
    } catch (error) {
      console.error("Erro ao buscar visualização do vídeo:", error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao buscar visualização do vídeo" });
    }
  }

  async removeVideoView(req: Request, res: Response) {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No signed-in user" });
      }

      const user = await userService.findByClerkId(auth.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { id } = req.params;
      await videoService.removeVideoView(id, user.id);

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover visualização do vídeo:", error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao remover visualização do vídeo" });
    }
  }

  async getTotalViews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const totalViews = await videoService.getTotalViews(id);
      return res.json({ totalViews });
    } catch (error) {
      console.error("Erro ao buscar total de visualizações:", error);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao buscar total de visualizações" });
    }
  }
}

// Exporta uma instância única do controller
export const videoController = new VideoController();
