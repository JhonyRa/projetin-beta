import { Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { createUserSchema, updateUserSchema, updateUserRoleSchema } from "../schemas/user.schema";
import { ZodError } from "zod";
import { userService } from "../services/user.service";
import { AppError } from "../errors/app-error";
import { UserRole } from "../@types/enums";

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const newUser = await userService.create(validatedData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const users = await userService.findAll(search as string);
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const user = await userService.findById(req.params.id);
      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await userService.update(
        req.params.id,
        validatedData
      );
      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      // Get auth to identify the requesting user
      const auth = getAuth(req);
      if (!auth || !auth.userId) {
        return res.status(401).json({ error: "Unauthorized: No signed-in user" });
      }

      // Check if the requesting user is an admin
      const requestingUser = await userService.findByClerkId(auth.userId);
      if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
        return res.status(403).json({ 
          error: "Forbidden: Only administrators can change user roles",
          statusCode: 403
        });
      }

      // Validate the incoming role data
      const validatedData = updateUserRoleSchema.parse(req.body);
      
      // Get the target user
      const targetUserId = req.params.id;
      
      // Update the user's role
      const updatedUser = await userService.updateRole(targetUserId, validatedData.role);
      
      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await userService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async me(req: Request, res: Response) {
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
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error in me endpoint:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}