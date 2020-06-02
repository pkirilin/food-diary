using System.Collections.Generic;

namespace FoodDiary.Domain.Entities
{
    /// <summary>
    /// Category of product (or dish) stored in diary
    /// </summary>
    public class Category
    {
        public int Id { get; set; }

        /// <summary>
        /// Category name
        /// </summary>
        public string Name { get; set; }

        public virtual ICollection<Product> Products { get; set; }
    }
}
