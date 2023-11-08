using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Models;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers;

// ReSharper disable once UnusedType.Global
class GetPageContentByIdRequestHandler : IRequestHandler<GetPageContentByIdRequest, PageContent>
{
    private readonly IPageRepository _pageRepository;

    public GetPageContentByIdRequestHandler(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<PageContent> Handle(GetPageContentByIdRequest request, CancellationToken cancellationToken)
    {
        var currentPage = await _pageRepository.GetByIdAsync(request.PageId, cancellationToken);
        return currentPage == null ? null : new PageContent(currentPage);
    }
}