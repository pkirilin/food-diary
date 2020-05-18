using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.UnitTests.Utils.Customizations;

namespace FoodDiary.UnitTests.Utils.Attributes
{
    class NotesWithTotalCaloriesCountAutoDataAttribute : AutoDataAttribute
    {
        public NotesWithTotalCaloriesCountAutoDataAttribute()
            : base(() => Fixtures.Custom
                .Customize(new NotesWithTotalCaloriesCountCustomization()))
        {
        }
    }

    class EmptyNotesWithZeroTotalCaloriesCountAutoDataAttribute : AutoDataAttribute
    {
        public EmptyNotesWithZeroTotalCaloriesCountAutoDataAttribute()
            : base(() => new Fixture()
                .Customize(new EmptyNotesWithZeroTotalCaloriesCountCustomization()))
        {
        }
    }
}
