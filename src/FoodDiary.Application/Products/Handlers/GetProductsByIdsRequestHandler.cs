using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    public class GetProductsByIdsRequestHandler : IRequestHandler<GetProductsByIdsRequest, List<Product>>
    {
        private readonly IProductRepository _productRepository;

        public GetProductsByIdsRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<List<Product>> Handle(GetProductsByIdsRequest request, CancellationToken cancellationToken)
        {
            return _productRepository.GetByIdsAsync(request.Ids, cancellationToken);
        }
    }
}
