import { Router } from 'express';
import { healthcheck } from './healtcheck';

export let router: Router = Router();
router.get('/healthcheck', healthcheck());