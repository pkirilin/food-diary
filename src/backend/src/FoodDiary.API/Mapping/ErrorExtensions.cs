using FoodDiary.Application;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Mapping;

public static class ErrorExtensions
{
    public static ObjectResult ToActionResult(this Error error)
    {
        var status = error switch
        {
            Error.ValidationError => StatusCodes.Status400BadRequest,
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