﻿using System;
using System.IO;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Repositories;
using FoodDiary.Infrastructure.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace FoodDiary.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddTransient<INoteRepository, NoteRepository>();
        services.AddTransient<ICategoryRepository, CategoryRepository>();
        services.AddTransient<IProductRepository, ProductRepository>();
    }

    public static void AddUtils(this IServiceCollection services)
    {
        services.AddTransient<ICaloriesCalculator, CaloriesCalculator>();
        services.AddTransient<INotesOrderCalculator, NotesOrderCalculator>();
    }

    public static void AddFoodDiarySwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            var xmlCommentsFilePath = Path.Combine(AppContext.BaseDirectory, "FoodDiary.API.xml");

            if (File.Exists(xmlCommentsFilePath))
            {
                c.IncludeXmlComments(xmlCommentsFilePath);
            }

            var commonApiInfo = new OpenApiInfo
            {
                Title = "FoodDiary API",
                Description = "This document describes API for FoodDiary application",
                Contact = new OpenApiContact()
                {
                    Name = "Pavel Kirilin",
                    Email = "kirilin.pav@gmail.com",
                    Url = new Uri("https://github.com/pkirilin/food-diary")
                },
                Version = "v1"
            };

            c.SwaggerDoc("v1", commonApiInfo);
        });
    }
}