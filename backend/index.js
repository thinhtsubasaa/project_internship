// import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes.js'
import brandsRoutes from './routes/brands.routes.js'
import modelsRoutes from './routes/models.routes.js'
import carsRoutes from './routes/cars.routes.js'
import driverLicensesRoutes from './routes/driverLicenses.routes.js'
import finalContractsRoutes from './routes/finalContracts.routes.js'
import couponsRoutes from './routes/coupons.routes.js'
import adminRoutes from './routes/admin.routes.js'
import databaseServices from './services/database.services.js'
import { defaultErrorHandler } from './middlewares/errors.middlewares.js'
import pkg from 'lodash'
import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import paymentsRoutes from './routes/payments.routes.js'
import { config } from 'dotenv'
import bookingRoutes from './routes/booking.routes.js'
import contractsRoutes from './routes/contracts.routes.js'

config()
const app = express()
const port = 4000
console.log('hello')

databaseServices.connect()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   next()
// })
app.options('/payments/create_payment_url', cors())
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`, // Thay đổi nguồn gốc tại đây nếu cần
    credentials: true // Cho phép sử dụng các credentials như cookie
  })
)
app.use(express.json())
app.use(cookieParser())

app.use('/users', usersRouter)
app.use('/cars', carsRoutes)
app.use('/brands', brandsRoutes)
app.use('/models', modelsRoutes)
app.use('/payments', paymentsRoutes)
app.use('/drivers', driverLicensesRoutes)
app.use('/bookings', bookingRoutes)
app.use('/coupons', couponsRoutes)
app.use('/contracts', contractsRoutes)
app.use('/final-contracts', finalContractsRoutes)
app.use('/admin', adminRoutes)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
