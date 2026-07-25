using System.Collections.Generic;

namespace FoodDiary.Domain.Entities;

/// <summary>
/// Eatable product (or dish) to store in diary  
/// </summary>
public class Product
{
    public int Id { get; set; }

    /// <summary>
    /// Product name
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Describes, how much calories the product would cost if its quantity is 100 g 
    /// </summary>
    public int CaloriesCost { get; set; }

    public int DefaultQuantity { get; set; } = 100;

    public int CategoryId { get; set; }

    public required decimal? Protein { get; set; }
    public required decimal? Fats { get; set; }
    public required decimal? Carbs { get; set; }
    public required decimal? Sugar { get; set; }
    public required decimal? Salt { get; set; }

    public Category? Category { get; set; }

    public virtual ICollection<Note> Notes { get; set; } = [];
}