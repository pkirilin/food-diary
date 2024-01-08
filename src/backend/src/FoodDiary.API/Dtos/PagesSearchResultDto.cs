using System.Collections.Generic;

namespace FoodDiary.API.Dtos;

public class PagesSearchResultDto
{
    public int TotalPagesCount { get; set; }

    public IEnumerable<PageItemDto> PageItems { get; set; }
}