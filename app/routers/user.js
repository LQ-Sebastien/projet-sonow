const express = require("express");

const validate = require("../validation/validator");
const createSchema = require("../validation/schemas/userCreateSchema");
const updateSchema = require("../validation/schemas/userUpdateSchema");

const router = express.Router();

const { userController: controller } = require("../controllers");

const controllerHandler = require("../services/controllerHandler");

router
  .route("/")
  .get(controllerHandler(controller.getAllUsers));

router
  .route("/login")
  .post(controllerHandler(controller.loginUser));

router
  .route("/signup")
  .post(
    validate("body", createSchema),
    controllerHandler(controller.createUser)
  );

router.route("/logout").get(controllerHandler(controller.logoutUser));

router
  .route("/search")
  .post(controllerHandler(controller.getOneUserByNickname));

router
  .route("/follow")
  .post(controllerHandler(controller.followUser))
  .delete(controllerHandler(controller.unfollowUser));

router
  .route("/:user_id")
  .get(controllerHandler(controller.getOneUserById))
  .patch(
    validate("body", updateSchema),
    controllerHandler(controller.updateUser)
  )
  .delete(controllerHandler(controller.deleteUser));

router
  .route("/:user_id/followers")
  .get(controllerHandler(controller.getFollowers));

router
  .route("/:user_id/followed")
  .get(controllerHandler(controller.getFollowed));

module.exports = router;
