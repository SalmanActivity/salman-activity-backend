import { Router } from 'express'
import { auth, admin, user } from '../auth'
import * as crud from './crud'

export let router: Router = Router()
