using System;
using System.Collections.Generic;

namespace FoodDiary.Domain.Entities;

public class Page
{
    public int Id { get; init; }
    public required DateOnly Date { get; set; }
    public ICollection<Note> Notes { get; set; }
}