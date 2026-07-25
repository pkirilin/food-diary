using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Delete;

public record DeleteProductCommand(int Id);

public abstract record DeleteProductResult
{
    public record Success : DeleteProductResult;

    public record NotFound : DeleteProductResult;
}

public class DeleteProductCommandHandler(IProductRepository productRepository)
{
    public async Task<DeleteProductResult> Handle(DeleteProductCommand command, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(command.Id, cancellationToken);

        if (product is null)
        {
            return new DeleteProductResult.NotFound();
        }

        productRepository.Remove(product);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteProductResult.Success();
    }
}
