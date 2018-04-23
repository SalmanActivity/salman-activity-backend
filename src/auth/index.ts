import { Express, Router } from 'express';
import { login } from './login';
import { auth } from './auth';

export let router: Router = Router();

router.post('/login', login());
router.post('/check_auth', auth(), (req, res) => {
    const reqObject = req as {};
    res.json({
        login: true,
        token: reqObject['token']
    });
});

export { login } from './login';
export { user, admin } from './roles';
export { auth } from './auth';