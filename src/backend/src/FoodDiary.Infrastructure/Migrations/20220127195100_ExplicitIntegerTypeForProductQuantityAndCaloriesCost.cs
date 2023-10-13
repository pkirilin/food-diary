using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDiary.Infrastructure.Migrations
{
    public partial class ExplicitIntegerTypeForProductQuantityAndCaloriesCost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("alter table \"Products\" alter column \"CaloriesCost\" type integer using \"CaloriesCost\"::integer;");
            migrationBuilder.Sql("alter table \"Notes\" alter column \"ProductQuantity\" type integer using \"ProductQuantity\"::integer;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
