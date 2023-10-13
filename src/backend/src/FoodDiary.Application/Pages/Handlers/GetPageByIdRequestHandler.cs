using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class GetPageByIdRequestHandler : IRequestHandler<GetPageByIdRequest, Page>
    {
        private readonly IPageRepository _pageRepository;

        public GetPageByIdRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public Task<Page> Handle(GetPageByIdRequest request, CancellationToken cancellationToken)
        {
            return _pageRepository.GetByIdAsync(request.Id, cancellationToken);
        }
    }
}
