using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Create;

public record CreateCategoryCommand(string Name);

public abstract record CreateCategoryResult
{
    public record Success(Category Category) : CreateCategoryResult;

    public record NameAlreadyExists : CreateCategoryResult;
}

public class CreateCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<CreateCategoryResult> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var query = categoryRepository.GetQueryWithoutTracking().Where(c => c.Name == command.Name);
        var categoriesWithSameName = await categoryRepository.GetByQueryAsync(query, cancellationToken);

        if (categoriesWithSameName.Count > 0)
        {
            return new CreateCategoryResult.NameAlreadyExists();
        }

        var category = categoryRepository.Add(new Category { Name = command.Name });
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new CreateCategoryResult.Success(category);
    }
}
