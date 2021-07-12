  
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/analyze',
    createProxyMiddleware({
      target: 'http://localhost:4193',
      changeOrigin: true,
    })
  );
};