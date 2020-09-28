const Koa = require('koa');
const Router = require('koa-router');

const googleAuthHelper = require('./googleAuthHelper.js');

const app = new Koa();
const router = new Router();

router.get('/google/authrequest', async (ctx, next) => {
    let url = googleAuthHelper.generateAuthUrl();
    ctx.redirect(url);
    await next();
});

router.get('/google/authredirect', async (ctx, next) => {
    const code = ctx.request.query.code;
    await googleAuthHelper.getToken(code);

    googleAuthHelper.startRefresh();
    await next();
});

app.use(router.routes())
app.use(router.allowedMethods());

app.listen(53000)