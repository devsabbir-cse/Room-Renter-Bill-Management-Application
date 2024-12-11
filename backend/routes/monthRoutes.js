const express = require('express');
const router = express.Router();
const monthController = require('../controllers/monthController');
const authGuard = require('./../middlewares/authGuard')
const userAuthGuard = require('./../middlewares/userAuthGuard')

// Route to handle table creation

router.post('/auth', monthController.auth);
router.post('/authUser', monthController.authUser);

router.get('/getAllMonth',authGuard , monthController.getAllMonth);

router.get('/UserGetAllMonth',userAuthGuard , monthController.UserGetAllMonth);


router.get('/CurrentMonthRecords/:tableName', authGuard,monthController.getCurrentMonthDetails);
router.get('/homePageGetCurrentMonthDetails/:requireEditingMonth',authGuard, monthController.homePageGetCurrentMonthDetails);
router.get('/require_editing_month',authGuard, monthController.getRequireEditingValue);


router.post('/create_new_month',authGuard, monthController.create_new_month);
router.post('/insert_into_table', authGuard,monthController.insert_into_table);
router.post('/dueSendMail',authGuard, monthController.dueSendMail);
router.post('/paySendMail',authGuard, monthController.paySendMail);

router.put('/updateRecord',authGuard, monthController.updateRecord);
router.put('/update_require_editing/', authGuard, monthController.updateRequireEditingMonth);



module.exports = router;
