using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    class CreatePageRequestHandler : IRequestHandler<CreatePageRequest, Page>
    {
        private readonly IPageRepository _pageRepository;

        public CreatePageRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public async Task<Page> Handle(CreatePageRequest request, CancellationToken cancellationToken)
        {
            var createdPage = _pageRepository.Add(request.Entity);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdPage;
        }
    }
}
