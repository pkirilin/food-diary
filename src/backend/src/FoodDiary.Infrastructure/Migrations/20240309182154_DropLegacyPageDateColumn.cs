using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDiary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropLegacyPageDateColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pages_Date",
                table: "Pages");
            
            migrationBuilder.DropColumn(
                name: "Date",
                table: "Pages");

            migrationBuilder.RenameColumn(
                name: "DateNew",
                newName: "Date",
                table: "Pages");
            
            migrationBuilder.CreateIndex(
                name: "IX_Pages_Date",
                table: "Pages",
                column: "Date",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                newName: "DateNew",
                table: "Pages");
            
            migrationBuilder.DropIndex(
                name: "IX_Pages_Date",
                table: "Pages");
            
            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Pages",
                type: "timestamp without time zone",
                nullable: false);
            
            migrationBuilder.CreateIndex(
                name: "IX_Pages_Date",
                table: "Pages",
                column: "Date",
                unique: true);
        }
    }
}
