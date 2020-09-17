using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class GetDateForNewPageRequestHandler : IRequestHandler<GetDateForNewPageRequest, DateTime>
    {
        private readonly IPageRepository _pageRepository;

        public GetDateForNewPageRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public async Task<DateTime> Handle(GetDateForNewPageRequest request, CancellationToken cancellationToken)
        {
            var query = _pageRepository.GetQueryWithoutTracking()
                .OrderByDescending(p => p.Date)
                .Take(1);

            var pages = await _pageRepository.GetByQueryAsync(query, cancellationToken);

            if (pages.Any())
                return pages.First().Date.AddDays(1);
            return DateTime.Now.Date;
        }
    }
}
