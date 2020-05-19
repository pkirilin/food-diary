using System.Collections.Generic;
using AutoFixture;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.UnitTests.Services.TestData
{
    class CategoryServiceTestData
    {
        public static IEnumerable<object[]> GetCategories
        {
            get
            {
                var fixture = Fixtures.Custom;

                var category1 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 1")
                    .Create();
                var category2 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 2")
                    .Create();
                var category3 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 3")
                    .Create();

                var sourceCategories = new List<Category> { category2, category3, category1 };
                var sourceCategoriesOrderedByName = new List<Category> { category1, category2, category3 };

                yield return new object[] { sourceCategories, sourceCategoriesOrderedByName };
            }
        }

        public static IEnumerable<object[]> IsCategoryExists
        {
            get
            {
                var fixture = Fixtures.Custom;

                var category1 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 1")
                    .Create();
                var category2 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 11")
                    .Create();
                var category3 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 2")
                    .Create();
                
                var sourceCategories = new List<Category> { category1, category2, category3 };
                var categoriesWithTheSameName = new List<Category> { category1 };
                var emptyCategories = new List<Category>();

                yield return new object[]
                {
                    "Category 1", sourceCategories, categoriesWithTheSameName, true
                };

                yield return new object[]
                {
                    "Not existing category", sourceCategories, emptyCategories, false
                };
            }
        }

        public static IEnumerable<object[]> GetCategoriesDropdown
        {
            get
            {
                var fixture = Fixtures.Custom;

                var category1 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 11")
                    .Create();
                var category2 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 1")
                    .Create();
                var category3 = fixture.Build<Category>()
                    .With(c => c.Name, "Category 2")
                    .Create();

                var request1 = fixture.Build<CategoryDropdownSearchRequest>()
                    .With(r => r.CategoryNameFilter, "Category 1")
                    .Create();
                var request2 = fixture.Build<CategoryDropdownSearchRequest>()
                    .With(r => r.CategoryNameFilter, "Category 1111")
                    .Create();
                var request3 = fixture.Build<CategoryDropdownSearchRequest>()
                    .Without(r => r.CategoryNameFilter)
                    .Create();
                var request4 = fixture.Build<CategoryDropdownSearchRequest>()
                    .With(r => r.CategoryNameFilter, "")
                    .Create();
                var request5 = fixture.Build<CategoryDropdownSearchRequest>()
                    .With(r => r.CategoryNameFilter, "   ")
                    .Create();

                var sourceCategories = new List<Category> { category1, category2, category3 };
                var categoriesOrderedByName = new List<Category> { category2, category1, category3 };
                var categoriesFilteredAndOrderedByName = new List<Category> { category2, category1 };
                var emptyCategories = new List<Category>();

                yield return new object[]
                {
                    request1, sourceCategories, categoriesFilteredAndOrderedByName
                };

                yield return new object[]
                {
                    request2, sourceCategories, emptyCategories
                };

                yield return new object[]
                {
                    request3, sourceCategories, categoriesOrderedByName
                };

                yield return new object[]
                {
                    request4, sourceCategories, categoriesOrderedByName
                };

                yield return new object[]
                {
                    request5, sourceCategories, categoriesOrderedByName
                };
            }
        }
    }
}
