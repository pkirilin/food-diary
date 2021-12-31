namespace FoodDiary.API.Dtos
{
    public class PageContentDto
    {
        public PageDto CurrentPage { get; set; }

        public PageDto PreviousPage { get; set; }
        
        public PageDto NextPage { get; set; }
    }
}
