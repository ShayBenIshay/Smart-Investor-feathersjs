import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { mongodb } from './mongodb'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import * as dotenv from 'dotenv'

dotenv.config()
const app: Application = koa(feathers())

app.configure(configuration(configurationValidator))

app.use(
  cors({
    origin: process.env.FRONTEND_CLIENT,
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: process.env.FRONTEND_CLIENT,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true
    }
  })
)
app.configure(mongodb)
app.configure(authentication)
app.configure(services)
app.configure(channels)

app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})

app.hooks({
  setup: [],
  teardown: []
})

export { app }
