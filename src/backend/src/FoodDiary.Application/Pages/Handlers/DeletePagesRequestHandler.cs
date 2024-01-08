using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers;

class DeletePagesRequestHandler : IRequestHandler<DeletePagesRequest, int>
{
    private readonly IPageRepository _pageRepository;

    public DeletePagesRequestHandler(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
    }

    public Task<int> Handle(DeletePagesRequest request, CancellationToken cancellationToken)
    {
        _pageRepository.RemoveRange(request.Entities);
        return _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
    }
}