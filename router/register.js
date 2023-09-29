const express = require("express")
const Controller = require("../controllers/controller.js")
const router = express.Router()

router.get('/',Controller.register)
router.get('/:role',Controller.register)
router.post('/:role',Controller.registerPost)


module.exports = router