using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Models;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class GetPageContentByIdRequestHandler : IRequestHandler<GetPageContentByIdRequest, PageContent>
    {
        private readonly IPageRepository _pageRepository;

        public GetPageContentByIdRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository;
        }

        public async Task<PageContent> Handle(GetPageContentByIdRequest request, CancellationToken cancellationToken)
        {
            var currentPage = await _pageRepository.GetPageByIdWithNotesAsync(request.PageId, cancellationToken);

            if (currentPage == null)
            {
                return null;
            }

            var previousPage = await _pageRepository.GetPreviousPageAsync(currentPage.Date, cancellationToken);
            var nextPage = await _pageRepository.GetNextPageAsync(currentPage.Date, cancellationToken);

            return new PageContent(currentPage, previousPage, nextPage);
        }
    }
}
