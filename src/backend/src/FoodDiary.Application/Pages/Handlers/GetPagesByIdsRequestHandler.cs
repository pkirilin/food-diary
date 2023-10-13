using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class GetPagesByIdsRequestHandler : IRequestHandler<GetPagesByIdsRequest, List<Page>>
    {
        private readonly IPageRepository _pageRepository;

        public GetPagesByIdsRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public Task<List<Page>> Handle(GetPagesByIdsRequest request, CancellationToken cancellationToken)
        {
            var query = _pageRepository.GetQuery().Where(p => request.Ids.Contains(p.Id));
            return _pageRepository.GetByQueryAsync(query, cancellationToken);
        }
    }
}
