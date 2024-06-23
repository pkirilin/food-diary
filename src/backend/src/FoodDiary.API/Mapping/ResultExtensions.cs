using System;
using FoodDiary.Application;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Mapping;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        return result switch
        {
            Result<T>.Success success => new OkObjectResult(success.Data),
            Result<T>.Failure failure => failure.Error.ToActionResult(),
            _ => throw new InvalidOperationException($"Unexpected result type: {result.GetType()}")
        };
    }

    private static ObjectResult ToActionResult(this Error error)
    {
        var status = error switch
        {
            Error.ValidationError => StatusCodes.Status400BadRequest,
            Error.InternalServerError => StatusCodes.Status500InternalServerError,
            _ => StatusCodes.Status500InternalServerError
        };
        
        return new ObjectResult(new ProblemDetails
        {
            Status = status,
            Title = error.Message,
            Detail = error.Description
        })
        {
            StatusCode = status
        };
    }
}