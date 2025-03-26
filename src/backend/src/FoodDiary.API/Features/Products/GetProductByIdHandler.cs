using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.Products.Contracts;
using FoodDiary.API.Features.Products.Extensions;
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
            .Where(p => p.Id == id)
            .Include(p => p.Category)
            .Select(p => p.ToGetProductByIdResponse())
            .FirstOrDefaultAsync(cancellationToken);

        return product is null
            ? new GetProductByIdHandlerResult.NotFound()
            : new GetProductByIdHandlerResult.Success(product);
    }
}