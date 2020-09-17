using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    class GetProductsByExactNameRequestHandler : IRequestHandler<GetProductsByExactNameRequest, List<Product>>
    {
        private readonly IProductRepository _productRepository;

        public GetProductsByExactNameRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<List<Product>> Handle(GetProductsByExactNameRequest request, CancellationToken cancellationToken)
        {
            var query = _productRepository.GetQueryWithoutTracking().Where(p => p.Name == request.Name);
            return _productRepository.GetByQueryAsync(query, cancellationToken);
        }
    }
}
