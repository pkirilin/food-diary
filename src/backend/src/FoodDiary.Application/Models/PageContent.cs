using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Models;

public class PageContent
{
    public Page CurrentPage { get; }
        
    public PageContent(Page currentPage)
    {
        CurrentPage = currentPage;
    }
}