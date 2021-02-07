using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Models
{
    public class PageContent
    {
        public Page CurrentPage { get; }

        public Page PreviousPage { get; }

        public Page NextPage { get; }
        
        public PageContent(Page currentPage, Page previousPage, Page nextPage)
        {
            CurrentPage = currentPage;
            PreviousPage = previousPage;
            NextPage = nextPage;
        }
    }
}
