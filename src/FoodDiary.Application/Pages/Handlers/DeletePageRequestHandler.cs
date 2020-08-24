using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    public class DeletePageRequestHandler : IRequestHandler<DeletePageRequest, int>
    {
        private readonly IPageRepository _pageRepository;

        public DeletePageRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public Task<int> Handle(DeletePageRequest request, CancellationToken cancellationToken)
        {
            _pageRepository.Delete(request.Entity);
            return _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
