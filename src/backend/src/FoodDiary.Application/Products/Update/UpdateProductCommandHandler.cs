using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Update;

public record UpdateProductCommand(
    int Id,
    string Name,
    int CaloriesCost,
    int DefaultQuantity,
    int CategoryId,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public abstract record UpdateProductResult
{
    public record Success : UpdateProductResult;

    public record NotFound : UpdateProductResult;

    public record NameAlreadyExists : UpdateProductResult;
}

public class UpdateProductCommandHandler(IProductRepository productRepository)
{
    public async Task<UpdateProductResult> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(command.Id, cancellationToken);

        if (product is null)
        {
            return new UpdateProductResult.NotFound();
        }

        var query = productRepository.GetQueryWithoutTracking().Where(p => p.Name == command.Name);
        var productsWithSameName = await productRepository.GetByQueryAsync(query, cancellationToken);
        var nameChanged = product.Name != command.Name;

        if (nameChanged && productsWithSameName.Count > 0)
        {
            return new UpdateProductResult.NameAlreadyExists();
        }

        product.Name = command.Name;
        product.CaloriesCost = command.CaloriesCost;
        product.DefaultQuantity = command.DefaultQuantity;
        product.CategoryId = command.CategoryId;
        product.Protein = command.Protein;
        product.Fats = command.Fats;
        product.Carbs = command.Carbs;
        product.Sugar = command.Sugar;
        product.Salt = command.Salt;

        productRepository.Update(product);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new UpdateProductResult.Success();
    }
}
