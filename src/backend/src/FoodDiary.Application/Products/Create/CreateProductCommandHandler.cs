using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Products.Create;

public record CreateProductCommand(
    string Name,
    int CaloriesCost,
    int DefaultQuantity,
    int CategoryId,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public abstract record CreateProductResult
{
    public record Success(Product Product) : CreateProductResult;

    public record ProductAlreadyExists : CreateProductResult;
}

public class CreateProductCommandHandler(IProductsRepository repository)
{
    public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        var productWithTheSameName = await repository.FindByExactName(command.Name, cancellationToken);

        if (productWithTheSameName is not null)
        {
            return new CreateProductResult.ProductAlreadyExists();
        }

        var product = new Product
        {
            Name = command.Name,
            CaloriesCost = command.CaloriesCost,
            DefaultQuantity = command.DefaultQuantity,
            CategoryId = command.CategoryId,
            Protein = command.Protein,
            Fats = command.Fats,
            Carbs = command.Carbs,
            Sugar = command.Sugar,
            Salt = command.Salt
        };

        await repository.Create(product, cancellationToken);
        return new CreateProductResult.Success(product);
    }
}
