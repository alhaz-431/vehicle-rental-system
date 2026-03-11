import { Request, Response } from 'express';
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from './vehicles.service';
import { sendSuccess, sendError } from '../../utils/response';

export const createVehicleHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
    if (!vehicle_name || !type || !registration_number || daily_rent_price === undefined) {
      sendError(res, 400, 'Validation error', 'vehicle_name, type, registration_number and daily_rent_price are required');
      return;
    }
    if (daily_rent_price <= 0) { sendError(res, 400, 'Validation error', 'daily_rent_price must be positive'); return; }
    const vehicle = await createVehicle({ vehicle_name, type, registration_number, daily_rent_price, availability_status });
    sendSuccess(res, 201, 'Vehicle created successfully', vehicle);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Registration number already exists' || message.includes('Vehicle type must be')) {
      sendError(res, 400, 'Validation error', message);
    } else { sendError(res, 500, 'Internal server error', message); }
  }
};

export const getAllVehiclesHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await getAllVehicles();
    if (vehicles.length === 0) { sendSuccess(res, 200, 'No vehicles found', []); }
    else { sendSuccess(res, 200, 'Vehicles retrieved successfully', vehicles); }
  } catch (error) { sendError(res, 500, 'Internal server error', (error as Error).message); }
};

export const getVehicleByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) { sendError(res, 400, 'Validation error', 'Invalid vehicle ID'); return; }
    const vehicle = await getVehicleById(vehicleId);
    sendSuccess(res, 200, 'Vehicle retrieved successfully', vehicle);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Vehicle not found') { sendError(res, 404, message); }
    else { sendError(res, 500, 'Internal server error', message); }
  }
};

export const updateVehicleHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) { sendError(res, 400, 'Validation error', 'Invalid vehicle ID'); return; }
    const vehicle = await updateVehicle(vehicleId, req.body);
    sendSuccess(res, 200, 'Vehicle updated successfully', vehicle);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Vehicle not found') { sendError(res, 404, message); }
    else if (message.includes('Vehicle type must be')) { sendError(res, 400, 'Validation error', message); }
    else { sendError(res, 500, 'Internal server error', message); }
  }
};

export const deleteVehicleHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    if (isNaN(vehicleId)) { sendError(res, 400, 'Validation error', 'Invalid vehicle ID'); return; }
    await deleteVehicle(vehicleId);
    sendSuccess(res, 200, 'Vehicle deleted successfully');
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Vehicle not found') { sendError(res, 404, message); }
    else if (message === 'Cannot delete vehicle with active bookings') { sendError(res, 400, message); }
    else { sendError(res, 500, 'Internal server error', message); }
  }
};