using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using FoodDiary.Domain.Exceptions;
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
            catch (ImportException importException)
            {
                await HandleExceptionAsBadRequestAsync(context, importException);
            }
            catch (Exception e)
            {
                await HandleExceptionAsInternalServerErrorAsync(context, e);
            }
        }

        private Task HandleExceptionAsInternalServerErrorAsync<TException>(HttpContext context, TException e)
            where TException : Exception
        {
            context.Response.ContentType = "text";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var errorDetailsSeparator = new String('-', 50);
            var fullErrorMessage = $"Internal server error\n{errorDetailsSeparator}\nMessage: {e.Message}\n{errorDetailsSeparator}\nStack trace: {e.StackTrace}\n{errorDetailsSeparator}";
            _logger.LogCritical(fullErrorMessage);
            return context.Response.WriteAsync(fullErrorMessage, Encoding.UTF8);
        }

        private Task HandleExceptionAsBadRequestAsync<TException>(HttpContext context, TException e)
            where TException : Exception
        {
            context.Response.ContentType = "text";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            return context.Response.WriteAsync(e.Message, Encoding.UTF8);
        }
    }
}
