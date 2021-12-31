using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Enums;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class GetPagesForExportRequestHandler : IRequestHandler<GetPagesForExportRequest, List<Page>>
    {
        private readonly IPageRepository _pageRepository;

        public GetPagesForExportRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public Task<List<Page>> Handle(GetPagesForExportRequest request, CancellationToken cancellationToken)
        {
            var query = _pageRepository.GetQueryWithoutTracking();

            if (request.StartDate.HasValue)
                query = query.Where(p => p.Date >= request.StartDate);
            if (request.EndDate.HasValue)
                query = query.Where(p => p.Date <= request.EndDate);

            query = query.OrderBy(p => p.Date);

            switch (request.LoadType)
            {
                case PagesLoadRequestType.OnlyNotesWithProducts:
                    query = _pageRepository.LoadNotesWithProducts(query);
                    break;
                case PagesLoadRequestType.All:
                    query = _pageRepository.LoadNotesWithProductsAndCategories(query);
                    break;
            }
            
            return _pageRepository.GetByQueryAsync(query, cancellationToken);
        }
    }
}
