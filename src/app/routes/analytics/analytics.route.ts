import { Router } from "express"
import { authorize } from "../../middlewares/authorize.middleware.js"
import { getDashboardAnalytics } from "../../controllers/analytics.controller.js"

const analyticsRoutes = Router()

analyticsRoutes.get("/", authorize(), getDashboardAnalytics)

export default analyticsRoutes
