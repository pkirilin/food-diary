using System.Collections.Generic;

namespace FoodDiary.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public virtual ICollection<Product> Products { get; set; }

        public bool HasChanges(string newName)
        {
            return Name != newName;
        }
    }
}
