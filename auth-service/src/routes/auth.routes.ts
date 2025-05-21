import express from 'express';
import { loginUser, registerUser, getMe, getUserById } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { createHospital, createHospitalAdmin, deleteAdminById, deleteHospitalById, getAllHospitalAdmins, getHospitalById, getHospitals, updateHospitalById } from '../controllers/superAdmin.controller';
import { checkRole } from '../middlewares/checkRole';
import { verify } from 'crypto';
import { User } from '../models/user.model';
const router = express.Router();

// Log incoming requests for the auth-service
router.post('/register', (req, res, next) => {
    console.log('[auth-service] Incoming request:', req.body);
    next();
  }, registerUser);  // Ensure this controller exists
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);//testing

//super admin functinalites
router.post('/hospitals',verifyToken, checkRole(['SUPER_ADMIN']) ,createHospital);    // Create hospital
router.get('/hospitals',getHospitals);       // List all hospitals
router.post('/create-admin',verifyToken,checkRole(['SUPER_ADMIN']),createHospitalAdmin);//super admins can only create admins for each hospital
router.delete('/hospitals/:id',verifyToken,checkRole(['SUPER_ADMIN']) ,deleteHospitalById);
router.put('/hospitals/:id',verifyToken,checkRole(['SUPER_ADMIN']) ,updateHospitalById);
router.get('/admins',verifyToken,checkRole(['SUPER_ADMIN']), getAllHospitalAdmins);

router.get('/hospitals/:id',  getHospitalById);

router.delete('/admins/:id', verifyToken,checkRole(['SUPER_ADMIN']), deleteAdminById);

router.get(
  '/user/:id',
  getUserById
);


// auth.routes.ts
router.delete('/delete-by-email/:email',  async (req, res) => {
  const { email } = req.params;
  console.log("reached user deletion in auth");
  const user = await User.findOneAndDelete({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json({ message: 'User deleted successfully' });
});

export default router;
