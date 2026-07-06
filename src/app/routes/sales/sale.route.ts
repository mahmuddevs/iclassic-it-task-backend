import { Router } from "express"
import { authorize } from "../../middlewares/authorize.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import { CreateSaleSchema } from "../../schemas/sale.schema.js"
import { createSale, getAllSales } from "../../controllers/sale.controller.js"

const saleRoutes = Router()

saleRoutes.post(
  "/",
  authorize("sales.create"),
  validate(CreateSaleSchema),
  createSale
)

saleRoutes.get(
  "/",
  authorize("sales.read"),
  getAllSales
)

export default saleRoutes
