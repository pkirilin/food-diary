using System;
using System.Collections.Generic;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using FoodDiary.UnitTests.Attributes;
using FoodDiary.UnitTests.Customizations;
using Xunit;

namespace FoodDiary.UnitTests.Utils
{
    public class CaloriesCalculatorTests
    {
        private readonly IFixture _fixture;

        public CaloriesCalculatorTests()
        {
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        ICaloriesCalculator Sut => new CaloriesCalculator();

        [Theory]
        [InlineData(0, 0, 0)]
        [InlineData(100, 0, 0)]
        [InlineData(0, 100, 0)]
        [InlineData(300, 60, 180)]
        [InlineData(170, 120, 204)]
        [InlineData(80, 240, 192)]
        [InlineData(168, 223, 374)]
        public void Calculator_CalculatesCaloriesForSingleNote(int productQuantity, int caloriesCost, int expectedResult)
        {
            var product = _fixture.Build<Product>()
                .With(p => p.CaloriesCost, caloriesCost)
                .Create();
            var note = _fixture.Build<Note>()
                .With(n => n.ProductQuantity, productQuantity)
                .With(n => n.Product, product)
                .Create();

            var result = Sut.Calculate(note);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [InlineData(-1, 100)]
        [InlineData(100, -1)]
        [InlineData(-1, -1)]
        public void Calculator_ThrowsArgumentException_WhenProductQuantityOrCaloriesCostIsNegative(int productQuantity, int caloriesCost)
        {
            var product = _fixture.Build<Product>()
                .With(p => p.CaloriesCost, caloriesCost)
                .Create();
            var note = _fixture.Build<Note>()
                .With(n => n.ProductQuantity, productQuantity)
                .With(n => n.Product, product)
                .Create();

            Sut.Invoking(sut => sut.Calculate(note))
                .Should()
                .Throw<ArgumentException>();
        }

        [Theory]
        [NotesWithTotalCaloriesCountAutoData]
        [EmptyNotesWithZeroTotalCaloriesCountAutoData]
        public void Calculator_CalculatesCaloriesForMultipleNotes(List<Note> notes, int expectedResult)
        {
            var result = Sut.Calculate(notes);

            result.Should().Be(expectedResult);
        }
    }
}
