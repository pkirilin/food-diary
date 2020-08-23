using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Models;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    public class GetProductsRequestHandler : IRequestHandler<GetProductsRequest, ProductsSearchResult>
    {
        private readonly IProductRepository _productRepository;

        public GetProductsRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public async Task<ProductsSearchResult> Handle(GetProductsRequest request, CancellationToken cancellationToken)
        {
            var totalProductsCount = default(int?);
            var query = _productRepository.GetQueryWithoutTracking();

            if (!String.IsNullOrWhiteSpace(request.ProductName))
                query = query.Where(p => p.Name.ToLower().Contains(request.ProductName.ToLower()));
            if (request.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == request.CategoryId);
            if (request.CalculateTotalProductsCount)
                totalProductsCount = await _productRepository.CountByQueryAsync(query, cancellationToken);
            if (request.LoadCategory)
                query = _productRepository.LoadCategory(query);

            query = query.OrderBy(p => p.Name)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize);

            var foundProducts = await _productRepository.GetListFromQueryAsync(query, cancellationToken);

            return new ProductsSearchResult()
            {
                FoundProducts = foundProducts,
                TotalProductsCount = totalProductsCount
            };
        }
    }
}
