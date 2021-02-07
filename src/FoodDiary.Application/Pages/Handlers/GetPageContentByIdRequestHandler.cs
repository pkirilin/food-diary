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
            
            var adjacentPages = await _pageRepository.GetAdjacentPagesAsync(currentPage.Date, cancellationToken);

            if (adjacentPages.Length != 2)
            {
                throw new InvalidOperationException(
                    $"Received adjacent pages of length = {adjacentPages.Length}, but expected length 2");
            }
            
            var previousPage = adjacentPages[0];
            var nextPage = adjacentPages[1];

            return new PageContent(currentPage, previousPage, nextPage);
        }
    }
}
