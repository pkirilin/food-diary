using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class PageEditDto : PageCreateDto
    {
        [Required]
        public int Id { get; set; }
    }
}
