using Microsoft.EntityFrameworkCore.Migrations;

namespace FoodDiary.Infrastructure.Migrations
{
    public partial class ChangedDoubleToIntForCaloriesAndQuantity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "CaloriesCost",
                table: "Products",
                nullable: false,
                oldClrType: typeof(double));

            migrationBuilder.AlterColumn<int>(
                name: "ProductQuantity",
                table: "Notes",
                nullable: false,
                oldClrType: typeof(double));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "CaloriesCost",
                table: "Products",
                nullable: false,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<double>(
                name: "ProductQuantity",
                table: "Notes",
                nullable: false,
                oldClrType: typeof(int));
        }
    }
}
