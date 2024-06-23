using System;
using System.ClientModel;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using FoodDiary.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Middlewares;

public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILoggerFactory loggerFactory,
        IProblemDetailsService problemDetailsService)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _problemDetailsService = problemDetailsService;
        _logger = loggerFactory.CreateLogger<ExceptionHandlerMiddleware>() ?? throw new ArgumentNullException(nameof(loggerFactory));
    }
    
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AccessDeniedException e)
        {
            await HandleExceptionAsync(context, e, HttpStatusCode.Forbidden);
        }
        catch (ImportException e)
        {
            await HandleExceptionAsync(context, e, HttpStatusCode.BadRequest);
        }
        catch (ClientResultException e)
        {
            await HandleExceptionAsProblemDetailsAsync(context, e, HttpStatusCode.InternalServerError, e.Message.Trim());
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
    
    private static Task HandleExceptionAsync<TException>(HttpContext context, TException e, HttpStatusCode statusCode)
        where TException : Exception
    {
        context.Response.ContentType = "text";
        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(e.Message, Encoding.UTF8);
    }
    
    private async ValueTask<bool> HandleExceptionAsProblemDetailsAsync(
        HttpContext context,
        Exception exception,
        HttpStatusCode statusCode,
        string detail)
    {
        context.Response.StatusCode = (int)statusCode;
        
        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            Exception = exception,
            ProblemDetails =
            {
                Title = "An error occurred",
                Detail = detail
            }
        });
    }
}