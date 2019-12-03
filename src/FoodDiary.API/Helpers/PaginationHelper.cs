using System;

namespace FoodDiary.API.Helpers
{
    public static class PaginationHelper
    {
        public static int GetTotalPagesCount(int totalItemsCount, int pageSize)
        {
            return (int)Math.Ceiling(totalItemsCount / (double)pageSize);
        }
    }
}
