using System.Collections.Generic;

namespace FoodDiary.Domain.Dtos
{
    public class ProductsPagedListDto
    {
        public int SelectedPageIndex { get; set; }

        public int TotalPagesCount { get; set; }

        public IEnumerable<ProductItemDto> Products { get; set; }
    }
}
