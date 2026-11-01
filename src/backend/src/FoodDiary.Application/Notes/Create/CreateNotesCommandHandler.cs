using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.Create;

public record CreateNotesCommand(
    DateOnly Date,
    MealType MealType,
    IReadOnlyList<CreateNotesCommand.Note> Notes)
{
    public record Note(int ProductId, int ProductQuantity);
}

public abstract record CreateNotesResult
{
    public record Success : CreateNotesResult;

    public record Failure(Error Error) : CreateNotesResult;

    public static Failure ProductNotFound(int productId) =>
        new(new Error.ValidationError($"Product with id {productId} not found"));
}

public class CreateNotesCommandHandler(IProductsRepository productsRepository, INotesRepository notesRepository)
{
    public async Task<CreateNotesResult> Handle(CreateNotesCommand command, CancellationToken cancellationToken)
    {
        foreach (var productId in command.Notes.Select(n => n.ProductId).Distinct())
        {
            var product = await productsRepository.FindById(productId, cancellationToken);

            if (product is null)
            {
                return CreateNotesResult.ProductNotFound(productId);
            }
        }

        var notesOfDate = await notesRepository.FindByDate(command.Date, cancellationToken);
        var firstDisplayOrder = notesOfDate
            .Where(n => n.MealType == command.MealType)
            .Select(n => n.DisplayOrder + 1)
            .DefaultIfEmpty(0)
            .Max();

        var notes = command.Notes
            .Select((note, index) => new Note
            {
                Date = command.Date,
                MealType = command.MealType,
                ProductId = note.ProductId,
                ProductQuantity = note.ProductQuantity,
                DisplayOrder = firstDisplayOrder + index
            })
            .ToList();

        await notesRepository.AddRange(notes, cancellationToken);
        return new CreateNotesResult.Success();
    }
}
