const express = require('express');
const userController=require('./../controllers/userController');
const authController=require('./../controllers/authController');
const router=express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.patch('/updateMyPassword',authController.protect,authController.updatePassword);
router.patch('/updateMe',authController.protect,userController.updateMe);
router.delete('/deleteMe',authController.protect,userController.deleteMe);

router
  .route('/') 
  .get(userController.getAllUsers)
  .post(userController.createUser);

  router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;