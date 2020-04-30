using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Middlewares
{
    public class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlerMiddleware> _logger;

        public ExceptionHandlerMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = loggerFactory?.CreateLogger<ExceptionHandlerMiddleware>() ?? throw new ArgumentNullException(nameof(loggerFactory));
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception e)
            {
                await HandleExceptionAsync(context, e);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception e)
        {
            context.Response.ContentType = "text";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var errorDetailsSeparator = new String('-', 50);
            var fullErrorMessage = $"Internal server error\n{errorDetailsSeparator}\nMessage: {e.Message}\n{errorDetailsSeparator}\nStack trace: {e.StackTrace}\n{errorDetailsSeparator}";
            _logger.LogCritical(fullErrorMessage);
            return context.Response.WriteAsync(fullErrorMessage, Encoding.UTF8);
        }
    }
}
