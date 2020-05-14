using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.UnitTests.Customizations;

namespace FoodDiary.UnitTests.Attributes
{
    class NotesWithTotalCaloriesCountAutoDataAttribute : AutoDataAttribute
    {
        public NotesWithTotalCaloriesCountAutoDataAttribute()
            : base(() => new Fixture().Customize(new NotesWithTotalCaloriesCountCustomization()))
        {
        }
    }

    class EmptyNotesWithZeroTotalCaloriesCountAutoDataAttribute : AutoDataAttribute
    {
        public EmptyNotesWithZeroTotalCaloriesCountAutoDataAttribute()
            : base(() => new Fixture().Customize(new EmptyNotesWithZeroTotalCaloriesCountCustomization()))
        {
        }
    }
}
