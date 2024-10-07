import express from 'express'
import queryController from '../controllers/query.controller.js'

const router = express.Router();

router.post('/createQuery', queryController.createQuery);
router.get('/getQueries', queryController.getAllQueries);
router.post('/updateQuery', queryController.updateQuery);

export default router;