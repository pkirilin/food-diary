using System.ClientModel;
using FoodDiary.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace FoodDiary.API.ErrorHandling;

public class ExceptionHandler(
    ILogger<ExceptionHandler> logger,
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError("{Exception}", exception);

        var (statusCode, detail) = exception switch
        {
            ImportException e => (StatusCodes.Status400BadRequest, e.Message.Trim()),
            ClientResultException e => (StatusCodes.Status500InternalServerError, e.Message.Trim()),
            _ => (StatusCodes.Status500InternalServerError, "Something went wrong")
        };
        
        httpContext.Response.StatusCode = statusCode;
        
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails =
            {
                Title = "An error occurred",
                Detail = detail
            }
        });
    }
}