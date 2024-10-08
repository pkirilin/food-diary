﻿using System;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Entities;

public class Note
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public MealType MealType { get; set; }
    public int ProductId { get; set; }
    public int ProductQuantity { get; set; }
    public int DisplayOrder { get; set; }
    
    public Product Product { get; set; }
}