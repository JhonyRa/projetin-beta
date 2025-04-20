import { Router } from "express";
import { FolderController } from "../controllers/folder.controller";
import { requireAuth } from "@clerk/express";
import { checkRole } from "../middlewares/check-role.middleware";
import { UserRole } from "../@types/enums";
import { Request } from "express";

const router = Router();
const folderController = new FolderController();

router.post(
  "/",
  requireAuth(),
  checkRole(undefined, (req: Request) => req.body.fatherFolderId),
  (req, res) => folderController.create(req, res)
);

router.get("/:folderId", requireAuth(), (req, res) =>
  folderController.findById(req, res)
);

router.get(
  "/:folderId/check-permission",
  requireAuth(),
  (req, res) => folderController.checkPermission(req, res)
);

router.patch(
  "/:folderId",
  requireAuth(),
  checkRole(undefined, (req: Request) => req.params.folderId),
  (req, res) => folderController.update(req, res)
);

router.delete(
  "/:folderId",
  requireAuth(),
  checkRole(undefined, (req: Request) => req.params.folderId),
  (req, res) => folderController.delete(req, res)
);

router.get("/", requireAuth(), (req, res) =>
  folderController.findAll(req, res)
);

router.get(
  "/:folderId/editors",
  requireAuth(),
  folderController.findEditors.bind(folderController)
);

export const folderRoutes = router;
