import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth } from "@clerk/express";
import { UserRole } from "../@types/enums";
import { checkRole } from "../middlewares/check-role.middleware";

const router = Router();

router.get("/me", requireAuth(), UserController.me);
router.post("/", requireAuth(), UserController.create);
router.get(
  "/",
  requireAuth(),
  UserController.findAll
);
router.get(
  "/:id",
  requireAuth(),
  UserController.findById
);
router.patch(
  "/:id",
  requireAuth(),
  checkRole([UserRole.ADMIN]),
  UserController.update
);
router.delete("/:id", requireAuth(), UserController.delete);

// Admin-only route to update user roles
router.patch("/:id/role", 
  requireAuth(), 
  checkRole([UserRole.ADMIN]), 
  UserController.updateRole
);

export const userRoutes = router;