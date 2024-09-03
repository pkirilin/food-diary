using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.Update;

public record UpdateNoteCommand(
    int Id,
    DateOnly Date,
    MealType MealType,
    int ProductId,
    int ProductQuantity,
    int DisplayOrder);

public record UpdateNoteResult
{
    public record Success : UpdateNoteResult;

    public record Failure(Error Error) : UpdateNoteResult;
    
    public static Failure ProductNotFound(int productId) =>
        new(new Error.ValidationError($"Product with id {productId} not found"));

    public static Failure NoteNotFound(int noteId) =>
        new(new Error.ValidationError($"Note with id {noteId} not found"));
}

public class UpdateNoteCommandHandler(IProductsRepository productsRepository, INotesRepository notesRepository)
{
    public async Task<UpdateNoteResult> Handle(UpdateNoteCommand command, CancellationToken cancellationToken)
    {
        var product = await productsRepository.FindById(command.ProductId, cancellationToken);
        
        if (product is null)
        {
            return UpdateNoteResult.ProductNotFound(command.ProductId);
        }

        var note = await notesRepository.FindById(command.Id, cancellationToken);
        
        if (note is null)
        {
            return UpdateNoteResult.NoteNotFound(command.Id);
        }
        
        note.Date = command.Date;
        note.MealType = command.MealType;
        note.ProductId = command.ProductId;
        note.ProductQuantity = command.ProductQuantity;
        note.DisplayOrder = command.DisplayOrder;
        
        await notesRepository.Update(note, cancellationToken);
        return new UpdateNoteResult.Success();
    }
}