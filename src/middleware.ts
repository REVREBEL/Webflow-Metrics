import type {MiddlewareHandler} from 'astro';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const {request, locals} = ctx;
  const url = new URL(request.url);

  // Expose Cloudflare runtime to locals
  // In Cloudflare Workers/Pages, the runtime is available on the request
  if ((request as any).cf) {
    (locals as any).runtime = {
      env: (ctx as any).env || {},
      cf: (request as any).cf,
      ctx: (ctx as any).ctx
    };
  }

  if (import.meta.env.DEV && url.pathname === '/-wf/ready') {
    const resHeaders = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    return new Response(JSON.stringify({ready: true}), {
      headers: resHeaders,
    });
  }

  return next();
};

