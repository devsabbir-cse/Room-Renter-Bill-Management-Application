const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const upload = require('../middlewares/multerConfig');

const authGuard = require('./../middlewares/authGuard')
const userAuthGuard = require('./../middlewares/userAuthGuard')

// POST route to create a new room with image upload
router.get('/rooms',authGuard, roomController.getAllRooms);
router.get('/getRoomData',authGuard, roomController.getRoomData);
router.get('/userGetRoomData',userAuthGuard, roomController.userGetRoomData);
// router.get('/getRoomNoAndMobileNo',authGuard, roomController.getRoomNoAndMobileNo);


router.post('/create-room',authGuard, upload.single('NID_FRONT'), roomController.createRoom);


router.put('/rooms/:roomNo',authGuard, roomController.updateRoom);
router.put('/rooms',authGuard, roomController.updateDue);
router.put('/rooms',authGuard, roomController.updateRoomDue);


router.delete('/rooms/:roomNo',authGuard, roomController.deleteRoom);




module.exports = router;
