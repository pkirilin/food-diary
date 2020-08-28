using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    class GetProductByIdRequestHandler : IRequestHandler<GetProductByIdRequest, Product>
    {
        private readonly IProductRepository _productRepository;

        public GetProductByIdRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<Product> Handle(GetProductByIdRequest request, CancellationToken cancellationToken)
        {
            return _productRepository.GetByIdAsync(request.Id, cancellationToken);
        }
    }
}
