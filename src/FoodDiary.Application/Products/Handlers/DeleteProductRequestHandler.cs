using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    class DeleteProductRequestHandler : IRequestHandler<DeleteProductRequest, int>
    {
        private readonly IProductRepository _productRepository;

        public DeleteProductRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<int> Handle(DeleteProductRequest request, CancellationToken cancellationToken)
        {
            _productRepository.Delete(request.Entity);
            return _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
