using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.Create;

public record CreateNoteCommand(
    DateOnly Date,
    MealType MealType,
    int ProductId,
    int ProductQuantity,
    int DisplayOrder);

public abstract record CreateNoteResult
{
    public record Success : CreateNoteResult;

    public record Failure(Error Error) : CreateNoteResult;

    public static Failure ProductNotFound(int productId) =>
        new(new Error.ValidationError($"Product with id {productId} not found"));
}

public class CreateNoteCommandHandler(IProductsRepository productsRepository, INotesRepository notesRepository)
{
    public async Task<CreateNoteResult> Handle(CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var product = await productsRepository.FindById(command.ProductId, cancellationToken);

        if (product is null)
        {
            return CreateNoteResult.ProductNotFound(command.ProductId);
        }

        var note = new Note
        {
            Date = command.Date,
            MealType = command.MealType,
            ProductId = command.ProductId,
            ProductQuantity = command.ProductQuantity,
            DisplayOrder = command.DisplayOrder
        };

        await notesRepository.Add(note, cancellationToken);
        return new CreateNoteResult.Success();
    }
}