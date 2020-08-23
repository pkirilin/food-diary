using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    public class DeleteProductsRequestHandler : IRequestHandler<DeleteProductsRequest, int>
    {
        private readonly IProductRepository _productRepository;

        public DeleteProductsRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<int> Handle(DeleteProductsRequest request, CancellationToken cancellationToken)
        {
            _productRepository.DeleteRange(request.Entities);
            return _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
