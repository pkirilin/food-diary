using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Products.Create;

public record CreateProductRequest(
    string Name,
    int CaloriesCost,
    int DefaultQuantity,
    int CategoryId) : IRequest<CreateProductResponse>;

public abstract record CreateProductResponse
{
    public record ProductAlreadyExists : CreateProductResponse;

    public record Success(Product Product) : CreateProductResponse;
}

[UsedImplicitly]
internal class CreateProductRequestHandler(
    IProductsRepository repository) : IRequestHandler<CreateProductRequest, CreateProductResponse>
{
    public async Task<CreateProductResponse> Handle(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var productWithTheSameName = await repository.FindByExactName(request.Name, cancellationToken);

        if (productWithTheSameName is not null)
        {
            return new CreateProductResponse.ProductAlreadyExists();
        }

        var product = new Product
        {
            Name = request.Name,
            CaloriesCost = request.CaloriesCost,
            DefaultQuantity = request.DefaultQuantity,
            CategoryId = request.CategoryId
        };

        await repository.Create(product, cancellationToken);

        return new CreateProductResponse.Success(product);
    }
}