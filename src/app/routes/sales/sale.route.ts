import { Router } from "express"
import { authorize } from "../../middlewares/authorize.middleware.js"
import { validate } from "../../middlewares/validate.middleware.js"
import { CreateSaleSchema } from "../../schemas/sale.schema.js"
import { createSale, getAllSales, deleteSale } from "../../controllers/sale.controller.js"

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

saleRoutes.delete(
  "/:id",
  authorize("sales.delete"),
  deleteSale
)

export default saleRoutes
