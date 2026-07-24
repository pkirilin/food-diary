using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Update;

public record UpdateCategoryCommand(int Id, string Name);

public abstract record UpdateCategoryResult
{
    public record Success : UpdateCategoryResult;

    public record NotFound : UpdateCategoryResult;

    public record NameAlreadyExists : UpdateCategoryResult;
}

public class UpdateCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<UpdateCategoryResult> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);

        if (category is null)
        {
            return new UpdateCategoryResult.NotFound();
        }

        var query = categoryRepository.GetQueryWithoutTracking().Where(c => c.Name == command.Name);
        var categoriesWithSameName = await categoryRepository.GetByQueryAsync(query, cancellationToken);
        var nameChanged = category.Name != command.Name;

        if (nameChanged && categoriesWithSameName.Count > 0)
        {
            return new UpdateCategoryResult.NameAlreadyExists();
        }

        category.Name = command.Name;
        categoryRepository.Update(category);
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new UpdateCategoryResult.Success();
    }
}
