import express from "express";
import { testMe } from "../controller/test.controller"; // correct path to controller

const testRouter = express.Router();

testRouter.get("/me", testMe);

export default testRouter;
