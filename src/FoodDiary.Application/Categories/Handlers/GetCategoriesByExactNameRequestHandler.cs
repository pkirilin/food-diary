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
    public class GetCategoriesByExactNameRequestHandler : IRequestHandler<GetCategoriesByExactNameRequest, List<Category>>
    {
        private readonly ICategoryRepository _categoryRepository;

        public GetCategoriesByExactNameRequestHandler(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public Task<List<Category>> Handle(GetCategoriesByExactNameRequest request, CancellationToken cancellationToken)
        {
            var query = _categoryRepository.GetQueryWithoutTracking().Where(c => c.Name == request.Name);
            return _categoryRepository.GetListFromQueryAsync(query, cancellationToken);
        }
    }
}
