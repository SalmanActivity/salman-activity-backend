import { Express, Router } from 'express';
import login from './login';
import auth from './auth';

export let router: Router = Router();

router.post('/login', login());
router.post('/check_auth', auth(), (req:any, res) => {
    res.json({
        login: true,
        token: req.token
    });
});

export { default as login } from './login';
export { user, admin } from './roles';
export { default as auth } from './auth';