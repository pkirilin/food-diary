using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.Products.Contracts;
using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.API.Features.Products;

public abstract record GetProductByIdHandlerResult
{
    public record Success(GetProductByIdResponse Product) : GetProductByIdHandlerResult;

    public record NotFound : GetProductByIdHandlerResult;
}

public class GetProductByIdHandler(FoodDiaryContext context)
{
    public async Task<GetProductByIdHandlerResult> Handle(int id, CancellationToken cancellationToken)
    {
        var product = await context.Products
            .Select(p => new GetProductByIdResponse
            {
                Id = p.Id,
                Name = p.Name,
                DefaultQuantity = p.DefaultQuantity,
                CaloriesCost = p.CaloriesCost,
                Category = new Category
                {
                    Id = p.CategoryId,
                    Name = p.Category.Name
                }
            })
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null)
            return new GetProductByIdHandlerResult.NotFound();

        return new GetProductByIdHandlerResult.Success(product);
    }
}