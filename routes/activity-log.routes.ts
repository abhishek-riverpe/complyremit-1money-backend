import { Router } from "express";
import { activityLogController } from "../controllers";
import validate from "../middlewares/validate";
import { getActivitySchema } from "../schemas/activity-log.schema";

const router = Router();

router.get("/", validate(getActivitySchema, "query"), activityLogController.getMyActivity);

export default router;
