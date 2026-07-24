using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Delete;

public record DeleteCategoryCommand(int Id);

public abstract record DeleteCategoryResult
{
    public record Success : DeleteCategoryResult;

    public record NotFound : DeleteCategoryResult;
}

public class DeleteCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<DeleteCategoryResult> Handle(DeleteCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);

        if (category is null)
        {
            return new DeleteCategoryResult.NotFound();
        }

        categoryRepository.Remove(category);
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteCategoryResult.Success();
    }
}
