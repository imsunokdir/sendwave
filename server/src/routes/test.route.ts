import express from "express";
import { fixNullCategories, testMe } from "../controller/test.controller"; // correct path to controller

const testRouter = express.Router();

testRouter.get("/me", testMe);
testRouter.post("/fix", fixNullCategories);

export default testRouter;
