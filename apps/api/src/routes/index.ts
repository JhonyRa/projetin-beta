import { Router } from 'express';
import { userRoutes } from './user.routes';
import videoRoutes from './video.routes';
import { folderRoutes } from './folder.routes';

const router = Router();

// Definindo as rotas com seus prefixos
router.use('/users', userRoutes);
router.use('/videos', videoRoutes);
router.use('/folders', folderRoutes);

export { router as apiRoutes }; 