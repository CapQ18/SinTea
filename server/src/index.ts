import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import users from './routes/users';
import shops from './routes/shops';
import feeds from './routes/feeds';
import wishlists from './routes/wishlists';
import upload from './routes/upload';

const app = new Hono();

app.use('/*', cors({
  origin: ['http://localhost:5173', 'https://*.sintea.pages.dev', 'https://*.pages.dev'],
  credentials: true
}));

app.route('/api/auth', auth);
app.route('/api/users', users);
app.route('/api/shops', shops);
app.route('/api/feeds', feeds);
app.route('/api/wishlists', wishlists);
app.route('/api/upload', upload);

app.get('/api/health', (c) => {
  return c.json({ success: true, message: 'SinTea API is running!' });
});

export default app;