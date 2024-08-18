using System;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Validation;
using FoodDiary.Application;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Infrastructure;
using JetBrains.Annotations;

namespace FoodDiary.API.Features.Notes.Create;

[PublicAPI]
public class CreateNoteRequest
{
    [DateRequired]
    public required DateOnly Date { get; init; }
    
    [EnumDataType(typeof(MealType))]
    public required MealType MealType { get; init; }

    [Range(1, int.MaxValue)]
    public required int ProductId { get; init; }

    [Range(1, int.MaxValue)]
    public required int PageId { get; init; }

    [Range(10, 1000, ErrorMessage = "Quantity value must be between 10 and 1000 cal")]
    public required int ProductQuantity { get; init; }

    [Range(0, int.MaxValue)]
    public required int DisplayOrder { get; init; }
}

public abstract record CreateNoteResponse
{
    public record Success : CreateNoteResponse;

    public record Failure(Error Error) : CreateNoteResponse;

    public static Failure ProductNotFound(int productId) =>
        new(new Error.ValidationError($"Product with id {productId} not found"));
}

public class CreateNoteRequestHandler(FoodDiaryContext context)
{
    public async Task<CreateNoteResponse> Handle(CreateNoteRequest request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FindAsync([request.ProductId], cancellationToken);

        if (product is null)
        {
            return CreateNoteResponse.ProductNotFound(request.ProductId);
        }

        var note = new Note
        {
            Date = request.Date,
            MealType = request.MealType,
            ProductId = request.ProductId,
            PageId = request.PageId,
            ProductQuantity = request.ProductQuantity,
            DisplayOrder = request.DisplayOrder
        };

        context.Notes.Add(note);
        await context.SaveChangesAsync(cancellationToken);
        return new CreateNoteResponse.Success();
    }
}