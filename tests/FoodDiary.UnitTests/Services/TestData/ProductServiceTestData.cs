using System.Collections.Generic;
using AutoFixture;
using FoodDiary.API.Metadata;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.UnitTests.Services.TestData
{
    class ProductServiceTestData
    {
        public static IEnumerable<object[]> SearchProducts
        {
            get
            {
                var fixture = Fixtures.Custom;

                var product1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product A")
                    .With(p => p.CategoryId, 1)
                    .Create();
                var product2 = fixture.Build<Product>()
                    .With(p => p.Name, "Product C")
                    .With(p => p.CategoryId, 2)
                    .Create();
                var product3 = fixture.Build<Product>()
                    .With(p => p.Name, "Product E")
                    .With(p => p.CategoryId, 2)
                    .Create();
                var product4 = fixture.Build<Product>()
                    .With(p => p.Name, "Product D")
                    .With(p => p.CategoryId, 1)
                    .Create();
                var product5 = fixture.Build<Product>()
                    .With(p => p.Name, "Product B")
                    .With(p => p.CategoryId, 1)
                    .Create();

                var sourceProducts = new List<Product>()
                {
                    product1, product2, product3, product4, product5
                };

                var resultProducts1 = new List<Product>() { product4, product3 };
                var resultProducts2 = new List<Product>() { product1, product5, product4 };
                var resultProducts3 = new List<Product>() { product2, product3 };
                var resultProducts4 = new List<Product>();

                var request1 = fixture.Build<ProductsSearchRequest>()
                    .With(r => r.PageNumber, 2)
                    .With(r => r.PageSize, 3)
                    .OmitAutoProperties()
                    .Create();
                var request2 = fixture.Build<ProductsSearchRequest>()
                    .With(r => r.PageNumber, 1)
                    .With(r => r.PageSize, 10)
                    .With(r => r.CategoryId, 1)
                    .OmitAutoProperties()
                    .Create();
                var request3 = fixture.Build<ProductsSearchRequest>()
                    .With(r => r.PageNumber, 1)
                    .With(r => r.PageSize, 10)
                    .With(r => r.CategoryId, 2)
                    .With(r => r.ProductSearchName, "Produ")
                    .OmitAutoProperties()
                    .Create();
                var request4 = fixture.Build<ProductsSearchRequest>()
                    .With(r => r.PageNumber, 1)
                    .With(r => r.PageSize, 10)
                    .With(r => r.ProductSearchName, "E")
                    .OmitAutoProperties()
                    .Create();

                var searchResult1 = fixture.Build<ProductsSearchResultMetadata>()
                    .With(r => r.TotalProductsCount, 5)
                    .With(r => r.FoundProducts, resultProducts1)
                    .Create();
                var searchResult2 = fixture.Build<ProductsSearchResultMetadata>()
                    .With(r => r.TotalProductsCount, 3)
                    .With(r => r.FoundProducts, resultProducts2)
                    .Create();
                var searchResult3 = fixture.Build<ProductsSearchResultMetadata>()
                    .With(r => r.TotalProductsCount, 2)
                    .With(r => r.FoundProducts, resultProducts3)
                    .Create();
                var searchResult4 = fixture.Build<ProductsSearchResultMetadata>()
                    .With(r => r.TotalProductsCount, 0)
                    .With(r => r.FoundProducts, resultProducts4)
                    .Create();

                yield return new object[]
                {
                    request1, sourceProducts, searchResult1
                };

                yield return new object[]
                {
                    request2, sourceProducts, searchResult2
                };

                yield return new object[]
                {
                    request3, sourceProducts, searchResult3
                };

                yield return new object[]
                {
                    request4, sourceProducts, searchResult4
                };
            }
        }

        public static IEnumerable<object[]> IsProductExists
        {
            get
            {
                var fixture = Fixtures.Custom;

                var product1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 1")
                    .Create();
                var product2 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 11")
                    .Create();
                var product3 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 2")
                    .Create();

                var sourceProducts = new List<Product> { product1, product2, product3 };
                var productsWithTheSameName = new List<Product> { product1 };
                var emptyProducts = new List<Product>();

                yield return new object[]
                {
                    "Product 1", sourceProducts, productsWithTheSameName, true
                };

                yield return new object[]
                {
                    "Product 11111", sourceProducts, emptyProducts, false
                };
            }
        }

        public static IEnumerable<object[]> GetProductsDropdown
        {
            get
            {
                var fixture = Fixtures.Custom;

                var product1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 11")
                    .Create();
                var product2 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 1")
                    .Create();
                var product3 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 2")
                    .Create();

                var request1 = fixture.Build<ProductDropdownSearchRequest>()
                    .With(r => r.ProductNameFilter, "Product 1")
                    .Create();
                var request2 = fixture.Build<ProductDropdownSearchRequest>()
                    .With(r => r.ProductNameFilter, "Product 11111")
                    .Create();
                var request3 = fixture.Build<ProductDropdownSearchRequest>()
                    .With(r => r.ProductNameFilter, "")
                    .Create();
                var request4 = fixture.Build<ProductDropdownSearchRequest>()
                    .With(r => r.ProductNameFilter, "   ")
                    .Create();
                var request5 = fixture.Build<ProductDropdownSearchRequest>()
                    .Without(r => r.ProductNameFilter)
                    .Create();

                var sourceProducts = new List<Product> { product1, product2, product3 };
                var sourceProductsOrderedByName = new List<Product> { product2, product1, product3 };
                var productsWithTheSameName = new List<Product> { product2, product1 };
                var emptyProducts = new List<Product>();

                yield return new object[]
                {
                    request1, sourceProducts, productsWithTheSameName
                };

                yield return new object[]
                {
                    request2, sourceProducts, emptyProducts
                };

                yield return new object[]
                {
                    request3, sourceProducts, sourceProductsOrderedByName
                };

                yield return new object[]
                {
                    request4, sourceProducts, sourceProductsOrderedByName
                };

                yield return new object[]
                {
                    request5, sourceProducts, sourceProductsOrderedByName
                };
            }
        }
    }
}
