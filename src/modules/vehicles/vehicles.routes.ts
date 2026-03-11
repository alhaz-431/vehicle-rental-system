import { Router } from 'express';
import { createVehicleHandler, getAllVehiclesHandler, getVehicleByIdHandler, updateVehicleHandler, deleteVehicleHandler } from './vehicles.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = Router();
router.post('/', authenticate, authorizeAdmin, createVehicleHandler);
router.get('/', getAllVehiclesHandler);
router.get('/:vehicleId', getVehicleByIdHandler);
router.put('/:vehicleId', authenticate, authorizeAdmin, updateVehicleHandler);
router.delete('/:vehicleId', authenticate, authorizeAdmin, deleteVehicleHandler);
export default router;