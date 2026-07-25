using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Delete;

public record DeleteProductsCommand(IReadOnlyCollection<int> Ids);

public abstract record DeleteProductsResult
{
    public record Success : DeleteProductsResult;
}

public class DeleteProductsCommandHandler(IProductRepository productRepository)
{
    public async Task<DeleteProductsResult> Handle(DeleteProductsCommand command, CancellationToken cancellationToken)
    {
        var query = productRepository.GetQuery().Where(p => command.Ids.Contains(p.Id));
        var products = await productRepository.GetByQueryAsync(query, cancellationToken);

        productRepository.RemoveRange(products);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteProductsResult.Success();
    }
}
