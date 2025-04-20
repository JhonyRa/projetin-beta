import { Router } from "express";
import multer from "multer";
import { videoController } from "../controllers/video.controller";
import { requireAuth } from "@clerk/express";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

router.post("/upload", requireAuth(), upload.single("video"), (req, res) =>
  videoController.uploadVideo(req, res)
);

router.get("/:id", requireAuth(), (req, res) =>
  videoController.getVideoUrl(req, res)
);

router.patch("/:id", requireAuth(), (req, res) =>
  videoController.updateVideo(req, res)
);

router.delete("/:id", requireAuth(), (req, res) =>
  videoController.delete(req, res)
);

router.post("/:id/view", requireAuth(), (req, res) =>
  videoController.markAsViewed(req, res)
);

router.delete("/:id/view", requireAuth(), (req, res) =>
  videoController.removeVideoView(req, res)
);

router.get("/:id/view", requireAuth(), (req, res) =>
  videoController.getVideoView(req, res)
);

router.get("/:id/total-views", requireAuth(), (req, res) =>
  videoController.getTotalViews(req, res)
);

export default router;
