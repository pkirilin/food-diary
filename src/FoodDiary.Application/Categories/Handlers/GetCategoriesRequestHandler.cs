using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Categories.Handlers
{
    class GetCategoriesRequestHandler : IRequestHandler<GetCategoriesRequest, List<Category>>
    {
        private readonly ICategoryRepository _categoryRepository;

        public GetCategoriesRequestHandler(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public Task<List<Category>> Handle(GetCategoriesRequest request, CancellationToken cancellationToken)
        {
            var query = _categoryRepository.GetQueryWithoutTracking();

            if (!String.IsNullOrWhiteSpace(request.CategoryNameFilter))
                query = query.Where(c => c.Name.ToLower().Contains(request.CategoryNameFilter.ToLower()));
            if (request.LoadProducts)
                query = _categoryRepository.LoadProducts(query);

            query = query.OrderBy(c => c.Name);
            return _categoryRepository.GetByQueryAsync(query, cancellationToken);
        }
    }
}
