using System.Collections.Generic;

namespace FoodDiary.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int CaloriesCost { get; set; }

        public int CategoryId { get; set; }

        public Category Category { get; set; }

        public virtual ICollection<Note> Notes { get; set; }
    }
}
