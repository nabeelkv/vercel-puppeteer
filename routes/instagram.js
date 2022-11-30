const express =  require('express');

const { downloadMedia } =  require('../controllers/instagram');

const router = express.Router();

router.get('/downloader', downloadMedia);

export default router;
