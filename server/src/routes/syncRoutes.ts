import express from "express";
import { startSync } from "../controller/syncController";
import { authMiddleware } from "../middlewares/authMiddlewares";

const syncRouter = express.Router();

syncRouter.post("/start", authMiddleware, startSync);

export default syncRouter;
