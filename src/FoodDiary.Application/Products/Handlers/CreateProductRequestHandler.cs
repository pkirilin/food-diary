using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    class CreateProductRequestHandler : IRequestHandler<CreateProductRequest, Product>
    {
        private readonly IProductRepository _productRepository;

        public CreateProductRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public async Task<Product> Handle(CreateProductRequest request, CancellationToken cancellationToken)
        {
            var createdProduct = _productRepository.Create(request.Entity);
            await _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdProduct;
        }
    }
}
